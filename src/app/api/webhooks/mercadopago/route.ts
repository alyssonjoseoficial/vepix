export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) {
      console.error("MP_WEBHOOK_SECRET não configurado.");
      return NextResponse.json({ error: "Configuração ausente" }, { status: 500 });
    }

    const xSignature = req.headers.get("x-signature");
    const xRequestId = req.headers.get("x-request-id");
    
    if (!xSignature || !xRequestId) {
      return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
    }

    // x-signature tem o formato: ts=123456,v1=hash_aqui
    const parts = xSignature.split(",");
    let ts = "";
    let hash = "";
    for (const part of parts) {
      const [key, value] = part.split("=");
      if (key === "ts") ts = value;
      if (key === "v1") hash = value;
    }

    const body = await req.json();
    const dataId = body?.data?.id;

    if (!dataId || body.type !== "payment") {
      return NextResponse.json({ received: true });
    }

    // Validação criptográfica do Mercado Pago
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(manifest).digest("hex");

    if (digest !== hash) {
      console.error("Assinatura de Webhook Inválida!");
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 403 });
    }

    // Assinatura válida. Buscar detalhes do pagamento no MP.
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) return NextResponse.json({ error: "Token ausente" }, { status: 500 });
    
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    
    const mpPayment = await payment.get({ id: dataId });
    
    if (mpPayment.status === "approved" && mpPayment.external_reference) {
      // external_reference formato: tenantId___planId
      const [tenantId, planId] = mpPayment.external_reference.split("___");
      
      if (tenantId && planId) {
        const existingSub = await prisma.subscription.findUnique({ where: { tenantId } });
        
        const now = new Date();
        const nextMonth = new Date();
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
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no webhook MP:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

