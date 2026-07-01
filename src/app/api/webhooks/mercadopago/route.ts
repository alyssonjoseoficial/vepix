export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => null);
    const dataId = body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");
    const type = body?.type || url.searchParams.get("type") || url.searchParams.get("topic");

    if (!dataId || type !== "payment") {
      return NextResponse.json({ received: true });
    }

    // Assinatura válida ou fallback (confiamos no payment.get). Buscar detalhes do pagamento no MP.
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) return NextResponse.json({ error: "Token ausente" }, { status: 500 });
    
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    
    const mpPayment = await payment.get({ id: dataId });
    
    if (mpPayment.status === "approved" && mpPayment.external_reference) {
      // external_reference formato: tenantId___planId
      const [tenantId, planId] = mpPayment.external_reference.split("___");
      
      if (tenantId && planId) {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

        const existingSub = await prisma.subscription.findUnique({ where: { tenantId } });
        
        const now = new Date();
        const trialEndsAt = new Date(tenant.createdAt);
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);

        let baseDate = now;
        if (existingSub?.currentPeriodEnd && existingSub.currentPeriodEnd > now) {
          baseDate = new Date(existingSub.currentPeriodEnd);
        } else if (trialEndsAt > now) {
          baseDate = trialEndsAt;
        }

        const nextMonth = new Date(baseDate);
        nextMonth.setDate(nextMonth.getDate() + 30); // Recarga de 30 dias

        if (existingSub) {
          await prisma.subscription.update({
            where: { tenantId },
            data: {
              planId,
              status: "ACTIVE",
              currentPeriodEnd: nextMonth,
            }
          });
        } else {
          await prisma.subscription.create({
            data: {
              tenantId,
              planId,
              status: "ACTIVE",
              currentPeriodEnd: nextMonth,
            }
          });
        }

        await prisma.platformNotification.create({
          data: {
            tenantId,
            message: `🎉 Assinatura SaaS Confirmada! Seu plano foi ativado com sucesso.`,
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no webhook MP:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

