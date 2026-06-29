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
  const checkoutUrl = await generateMercadoPagoCheckoutUrl(tenantId, planId, price);
  
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

  return checkoutUrl;
}
