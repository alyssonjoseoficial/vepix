export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dataId = url.searchParams.get("data.id") || url.searchParams.get("id");
    const type = url.searchParams.get("type") || url.searchParams.get("topic");

    if (type !== "payment" || !dataId) {
      return NextResponse.json({ received: true });
    }

    // Buscamos o webhook raw body para validar futuramente (assinatura digital)
    // Mas para MVP vamos confiar no ID recebido (Mercado Pago sempre valida as requisições)
    
    // O problema aqui é: como sabemos qual loja recebeu esse pagamento para pegar o accessToken?
    // O ideal no SaaS é passar o tenantId na notification_url na hora de gerar o preference.
    // Mas, se estamos usando chaves, e recebemos o webhook no endpoint global, não sabemos a loja!
    // Como solução contorno, iteramos sobre as lojas, ou buscamos no nosso DB pelo paymentId guardado!
    // Mas wait... no processPayment nós criamos o Order e NÃO salvamos o paymentId (transação MP) no Order!
    
    // PRECISAMOS SALVAR O trackingCode (ou um novo campo mpPaymentId) no Order.
    // Vamos adicionar agora.
    
    // NOTE: Para MVP, se o Webhook for acionado sem identificador da loja, 
    // precisaremos buscar no banco `trackingCode == dataId`.
    
    const order = await prisma.order.findFirst({
      where: { trackingCode: dataId }
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: order.tenantId },
      include: { settings: true }
    });

    if (!tenant?.settings?.mpAccessToken) {
      return NextResponse.json({ error: "Loja não configurada." }, { status: 400 });
    }

    const client = new MercadoPagoConfig({ accessToken: tenant.settings.mpAccessToken });
    const payment = new Payment(client);
    
    const mpPayment = await payment.get({ id: dataId });

    if (mpPayment.status === "approved" && order.status !== "PAID") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID" }
        }),
        prisma.platformNotification.create({
          data: {
            tenantId: tenant.id,
            message: `💰 Pagamento Aprovado! O pedido #${order.id.slice(-8)} de ${order.customerName} acabou de ser pago.`,
          }
        })
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

