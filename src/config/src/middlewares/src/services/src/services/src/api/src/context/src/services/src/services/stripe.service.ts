import Stripe from "stripe";
import { prisma } from "../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-01" });

export const createCheckoutSession = async (userId: string, courseId: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Course not found");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: (await prisma.user.findUnique({ where: { id: userId } }))?.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: course.title },
          unit_amount: Number(course.price) * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/success`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    metadata: { userId, courseId },
  });

  await prisma.payment.create({
    data: {
      userId,
      amount: course.price,
      method: "stripe",
      status: "PENDING",
    },
  });

  return session.url;
};

export const handleWebhook = async (payload: Buffer, sig: string) => {
  const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, courseId } = session.metadata!;
    const payment = await prisma.payment.findFirst({
      where: { userId, status: "PENDING" },
    });
    if (payment) {
      await prisma.$transaction([
        prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" } }),
        prisma.enrollment.create({ data: { userId, courseId } }),
      ]);
    }
  }
};
