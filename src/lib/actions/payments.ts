"use server";

import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { headers } from "next/headers";

export async function processPayment(
  storeSlug: string,
  paymentData: any,
  orderData: any
) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: storeSlug },
    include: { settings: true, products: true },
  });

  if (!tenant || !tenant.settings?.mpAccessToken) {
    return { error: "Loja não configurada para pagamentos." };
  }

  const client = new MercadoPagoConfig({ accessToken: tenant.settings.mpAccessToken });
  const payment = new Payment(client);

  try {
    // 1. Calcular o total do pedido localmente (segurança)
    const items = orderData.cart
      .map((item: any) => {
        const product = tenant.products.find((p) => p.id === item.productId && p.active);
        if (!product || product.stock < item.quantity) return null;
        return {
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          price: product.price,
        };
      })
      .filter(Boolean) as any[];

    if (!items.length) return { error: "Produtos indisponíveis." };

    let total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const shippingCost = orderData.shippingCost ? Number(orderData.shippingCost) : 0;
    
    let discountAmount = 0;
    let couponId = null;

    if (orderData.couponId) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: orderData.couponId, tenantId: tenant.id }
      });
      if (coupon && coupon.active) {
        if (!coupon.expiresAt || new Date() <= coupon.expiresAt) {
          if (!coupon.maxUses || coupon.currentUses < coupon.maxUses) {
            if (!coupon.minOrderValue || total >= Number(coupon.minOrderValue)) {
              if (coupon.discountType === "PERCENTAGE") {
                discountAmount = (total * Number(coupon.discountValue)) / 100;
              } else {
                discountAmount = Number(coupon.discountValue);
              }
              couponId = coupon.id;
            }
          }
        }
      }
    }

    const finalTotal = Math.max(0, total + shippingCost - discountAmount);

    // 2. Processar Pagamento no MP
    const requestOptions = {
      idempotencyKey: Math.random().toString(36).substring(7),
    };

    let mpBody: any;
    
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    
    const notificationUrl = !appUrl.includes("localhost") 
      ? `${appUrl}/api/webhooks/store-payment` 
      : undefined;

    if (paymentData.isDirectPix) {
      mpBody = {
        transaction_amount: Number(finalTotal.toFixed(2)),
        description: `Pedido na loja ${tenant.name}`,
        payment_method_id: 'pix',
        payer: {
          email: orderData.customerEmail,
          first_name: orderData.customerName.split(" ")[0],
          last_name: orderData.customerName.split(" ").slice(1).join(" ") || "Cliente",
        },
      };
      if (notificationUrl) {
        mpBody.notification_url = notificationUrl;
      }
    } else {
      mpBody = {
        ...paymentData.formData,
        transaction_amount: Number(finalTotal.toFixed(2)),
        description: `Pedido na loja ${tenant.name}`,
      };
      if (notificationUrl) {
        mpBody.notification_url = notificationUrl;
      }
    }

    const mpResponse = await payment.create({
      body: mpBody,
      requestOptions,
    });

    // 3. Criar Pedido no nosso Banco
    const orderStatus = mpResponse.status === "approved" ? "PAID" : "PENDING";
    
    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        status: orderStatus as any,
        shippingAddress: orderData.shippingAddress,
        shippingZipCode: orderData.shippingZipCode,
        shippingCost: orderData.shippingCost,
        paymentMethod: paymentData.isDirectPix ? "PIX" : "CARD",
        total: finalTotal,
        couponId: couponId,
        discountAmount: discountAmount > 0 ? discountAmount : null,
        trackingCode: mpResponse.id?.toString(),
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });

    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { currentUses: { increment: 1 } },
      });
    }

    // Subtrair estoque
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    return { 
      success: true, 
      orderId: order.id, 
      mpStatus: mpResponse.status,
      ticketUrl: mpResponse.point_of_interaction?.transaction_data?.ticket_url,
      qrCodeBase64: mpResponse.point_of_interaction?.transaction_data?.qr_code_base64,
      qrCode: mpResponse.point_of_interaction?.transaction_data?.qr_code,
    };

  } catch (error: any) {
    console.error("Erro MP:", error);
    let errorMessage = "Erro ao processar o pagamento com o Mercado Pago.";
    if (error && error.message) {
      errorMessage = error.message;
    }
    // Para depuração
    if (error && error.cause) {
      const cause = error.cause as any;
      if (cause.length > 0 && cause[0].message) {
         errorMessage = `Erro MP: ${cause[0].message}`;
      }
    }
    return { error: errorMessage };
  }
}
