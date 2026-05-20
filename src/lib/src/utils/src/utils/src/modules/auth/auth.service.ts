import { prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";

export const register = async (email: string, password: string, name: string) => {
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: hashed, name }
  });
  return user;
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

  return { user, accessToken, refreshToken };
};
