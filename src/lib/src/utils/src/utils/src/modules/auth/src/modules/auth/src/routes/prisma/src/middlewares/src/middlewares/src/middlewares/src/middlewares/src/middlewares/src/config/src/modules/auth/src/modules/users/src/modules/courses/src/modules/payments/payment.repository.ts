import { prisma } from "../../lib/prisma";

export const createPayment = (data: any) => prisma.payment.create({ data });

export const updatePaymentStatus = (id: string, status: string) =>
  prisma.payment.update({ where: { id }, data: { status } });

export const findPaymentById = (id: string) => prisma.payment.findUnique({ where: { id } });
