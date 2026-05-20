import { prisma } from "../../lib/prisma";

export const findUserById = (id: string) => prisma.user.findUnique({ where: { id } });

export const updateUser = (id: string, data: any) =>
  prisma.user.update({ where: { id }, data });

export const deleteUser = (id: string) =>
  prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
