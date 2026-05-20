import { prisma } from "../../lib/prisma";

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

export const createUser = (data: any) => prisma.user.create({ data });

export const saveRefreshToken = (userId: string, token: string, expiresAt: Date) =>
  prisma.refreshToken.create({ data: { userId, token, expiresAt } });

export const revokeRefreshToken = (token: string) =>
  prisma.refreshToken.update({ where: { token }, data: { revoked: true } });

export const findRefreshToken = (token: string) =>
  prisma.refreshToken.findUnique({ where: { token } });

export const createSession = (userId: string, device: string, ip: string, userAgent: string, expiresAt: Date) =>
  prisma.session.create({ data: { userId, device, ip, userAgent, expiresAt } });

export const invalidateSession = (id: string) =>
  prisma.session.delete({ where: { id } });
