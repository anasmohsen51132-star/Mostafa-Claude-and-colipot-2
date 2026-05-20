import Stripe from "stripe";
import { prisma } from "../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-01" });

export const handleWebhook = async (payload: Buffer, sig: string) => {
  const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);

  const existing = await prisma.auditLog.findUnique({ where: { action: event.id } });
  if (existing) return; // idempotency

  await prisma.auditLog.create({ data: { action: event.id } });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, courseId } = session.metadata!;
    const payment = await prisma.payment.findFirst({
      where: { userId, status: "PENDING" },
    });
    if (payment) {
      await prisma.$transaction([
        prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" } }),
        prisma.enrollment.upsert({
          where: { userId_courseId: { userId, courseId } },
          update: {},
          create: { userId, courseId },
        }),
        prisma.invoice.create({
          data: {
            paymentId: payment.id,
            pdfUrl: `https://invoices.example/${payment.id}.pdf`,
          },
        }),
      ]);
    }
  }
};
