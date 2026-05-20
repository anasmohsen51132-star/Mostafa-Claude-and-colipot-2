import { prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import * as AuthRepo from "./auth.repository";
import { addAuditLog } from "../../services/audit.service";

export const register = async (email: string, password: string, name: string) => {
  const hashed = await hashPassword(password);
  const user = await AuthRepo.createUser({ email, password: hashed, name });
  await addAuditLog(user.id, "REGISTER");
  return user;
};

export const login = async (email: string, password: string, ip: string, userAgent: string) => {
  const user = await AuthRepo.findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new Error("Account locked");
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: { increment: 1 } },
    });
    if (user.failedLogins + 1 >= 5) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) },
      });
    }
    throw new Error("Invalid credentials");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLogins: 0, lockedUntil: null },
  });

  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

  await AuthRepo.saveRefreshToken(user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  await AuthRepo.createSession(user.id, "web", ip, userAgent, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  await addAuditLog(user.id, "LOGIN");

  return { user, accessToken, refreshToken };
};

export const logout = async (token: string) => {
  await AuthRepo.revokeRefreshToken(token);
};
