"use server";

import { redirect } from "next/navigation";
import { requireTenantAccess } from "@/lib/tenant";
import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function createCheckoutSession(planSlug: string) {
  const { tenant } = await requireTenantAccess();
  
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const plan = PLANS.find((p) => p.slug === planSlug);
  if (!plan) throw new Error("Plano inválido");

  // Verifica se o tenant já tem um Customer do Stripe vinculado
  let customerId = tenant.subscription?.stripeCustomerId;

  if (!customerId) {
    // Busca ou cria o Customer no Stripe associado a esse tenant
    // Idealmente recuperaríamos o email do dono do tenant, usaremos um genérico por enquanto
    const customer = await stripe.customers.create({
      metadata: {
        tenantId: tenant.id,
      },
    });
    customerId = customer.id;

    // Atualiza o subscription local se não existir
    if (!tenant.subscription) {
      // Como o ID do plano atual (interno) precisa vir do banco e "planId" refere-se à tabela Plan,
      // devemos garantir que o plano exista no banco.
      // Neste modelo estático de planos, vamos apenas criar/atualizar a assinatura associando o stripeCustomerId.
      // Obs: A verdadeira lógica exige que os planos do banco correspondam ao do Stripe.
    }
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: plan.stripePriceId, // Precisamos ter o Price ID do Stripe no banco ou estático!
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
    metadata: {
      tenantId: tenant.id,
      planSlug: plan.slug,
    },
  });

  if (session.url) {
    redirect(session.url);
  }
}
