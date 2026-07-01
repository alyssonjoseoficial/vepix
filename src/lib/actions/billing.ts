"use server";

import { requireTenantAccess } from "@/lib/tenant";
import { generateMercadoPagoCheckoutUrl } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";

export async function createCheckoutSession(planId: string, price: number) {
  // Garantir que a pessoa logada é dona dessa loja
  const { tenant } = await requireTenantAccess();
  const tenantId = tenant.id;

  // Aqui nós chamaríamos a API do Mercado Pago
  // Para fins de MVP / Simulação, vamos retornar um link falso que será resolvido no webhook simulado
  const checkoutData = await generateMercadoPagoCheckoutUrl(tenantId, planId, price);
  
  // Opcional: já podemos criar uma Subscription "INCOMPLETE" no banco, se não existir
  const existingSub = await prisma.subscription.findUnique({ where: { tenantId } });
  if (!existingSub) {
    await prisma.subscription.create({
      data: {
        tenantId,
        planId,
        status: "INCOMPLETE",
      }
    });
  } else if (existingSub.status === "CANCELED" || existingSub.status === "PAST_DUE" || existingSub.planId !== planId) {
     await prisma.subscription.update({
       where: { tenantId },
       data: { planId, status: "INCOMPLETE" }
     });
  }

  return checkoutData;
}

import { MercadoPagoConfig, Payment } from "mercadopago";
import { headers } from "next/headers";

export async function processSaaSPayment(planId: string, price: number, paymentData: any) {
  const { tenant } = await requireTenantAccess();
  
  if (!process.env.MP_ACCESS_TOKEN) {
    return { error: "Plataforma não configurada para receber pagamentos." };
  }

  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
  const payment = new Payment(client);

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    
    const notificationUrl = !appUrl.includes("localhost") 
      ? `${appUrl}/api/webhooks/mercadopago` 
      : undefined;

    let mpBody: any;

    if (paymentData.isDirectPix) {
      mpBody = {
        transaction_amount: Number((price / 100).toFixed(2)),
        description: `Assinatura VePix SaaS - Loja ${tenant.name}`,
        payment_method_id: 'pix',
        payer: {
          email: paymentData.email || "contato@vepix.com.br",
          first_name: tenant.name,
        },
        external_reference: `${tenant.id}___${planId}`,
      };
    } else {
      mpBody = {
        ...paymentData.formData,
        transaction_amount: Number((price / 100).toFixed(2)),
        description: `Assinatura VePix SaaS - Loja ${tenant.name}`,
        external_reference: `${tenant.id}___${planId}`,
      };
    }

    if (notificationUrl) {
      mpBody.notification_url = notificationUrl;
    }

    const mpResponse = await payment.create({
      body: mpBody,
      requestOptions: {
        idempotencyKey: Math.random().toString(36).substring(7),
      }
    });

    const isApproved = mpResponse.status === "approved";
    
    // Calculate new expiration date
    const now = new Date();
    const trialEndsAt = new Date(tenant.createdAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    
    const existingSub = await prisma.subscription.findUnique({ where: { tenantId: tenant.id } });
    
    let baseDate = now;
    if (existingSub?.currentPeriodEnd && existingSub.currentPeriodEnd > now) {
      baseDate = new Date(existingSub.currentPeriodEnd);
    } else if (trialEndsAt > now) {
      baseDate = trialEndsAt;
    }
    
    const nextMonth = new Date(baseDate);
    if (isApproved) {
      nextMonth.setDate(nextMonth.getDate() + 30);
    }

    // Update subscription
    if (!existingSub) {
      await prisma.subscription.create({
        data: {
          tenantId: tenant.id,
          planId,
          status: isApproved ? "ACTIVE" : "INCOMPLETE",
          ...(isApproved ? { currentPeriodEnd: nextMonth } : {})
        }
      });
    } else {
      await prisma.subscription.update({
        where: { tenantId: tenant.id },
        data: { 
          planId, 
          status: isApproved ? "ACTIVE" : "INCOMPLETE",
          ...(isApproved ? { currentPeriodEnd: nextMonth } : {})
        }
      });
    }

    return { 
      success: true,
      status: mpResponse.status,
      ticketUrl: mpResponse.point_of_interaction?.transaction_data?.ticket_url,
      qrCodeBase64: mpResponse.point_of_interaction?.transaction_data?.qr_code_base64,
      qrCode: mpResponse.point_of_interaction?.transaction_data?.qr_code,
    };

  } catch (error: any) {
    console.error("Erro Pagamento SaaS:", error);
    let errorMessage = "Erro ao processar pagamento.";
    if (error && error.message) errorMessage = error.message;
    if (error && error.cause) {
      const cause = error.cause as any;
      if (cause.length > 0 && cause[0].message) errorMessage = cause[0].message;
    }
    return { error: errorMessage };
  }
}
