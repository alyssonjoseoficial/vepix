export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  if (!stripe) return new NextResponse("Stripe not configured", { status: 500 });

  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) throw new Error("Missing Webhook Secret");
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;
    const tenantId = session.metadata?.tenantId;
    const planSlug = session.metadata?.planSlug;

    if (tenantId && planSlug) {
      const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
      if (plan) {
        await prisma.subscription.upsert({
          where: { tenantId },
          create: {
            tenantId,
            planId: plan.id,
            status: "ACTIVE",
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
          update: {
            planId: plan.id,
            status: "ACTIVE",
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
        });
      }
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscriptionId = session.subscription as string;
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: "ACTIVE" },
    });
  }

  if (event.type === "invoice.payment_failed") {
    const subscriptionId = session.subscription as string;
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: "PAST_DUE" },
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscriptionId = (event.data.object as Stripe.Subscription).id;
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: "CANCELED" },
    });
  }

  return new NextResponse(null, { status: 200 });
}

