import { Preference, MercadoPagoConfig } from 'mercadopago';

export async function generateMercadoPagoCheckoutUrl(tenantId: string, planId: string, price: number) {
  if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error("A chave MP_ACCESS_TOKEN não está configurada no servidor (.env).");
  }

  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
  const preference = new Preference(client);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://minhaloja.com.br";
  
  const response = await preference.create({
    body: {
      items: [
        {
          id: planId,
          title: "Assinatura VePix SaaS",
          quantity: 1,
          unit_price: Number((price / 100).toFixed(2)),
          currency_id: "BRL"
        }
      ],
      external_reference: `${tenantId}___${planId}`,
      back_urls: {
        success: `${appUrl}/dashboard/billing`,
        failure: `${appUrl}/dashboard/billing`,
        pending: `${appUrl}/dashboard/billing`,
      },
      auto_return: "approved",
      notification_url: appUrl.startsWith("https://") && !appUrl.includes("localhost") 
        ? `${appUrl}/api/webhooks/mercadopago` 
        : undefined,
    }
  });

  return { url: response.init_point || "", id: response.id || "" };
}
