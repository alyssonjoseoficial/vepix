"use server";

import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export async function getFinancialMetrics() {
  await requirePlatformAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Receita Recorrente Mensal (MRR) -> Soma dos planos de assinaturas ACTIVE (plan.priceMonthly é em centavos)
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: { plan: true },
  });
  const mrr = activeSubscriptions.reduce((acc, sub) => acc + ((sub.plan?.priceMonthly || 0) / 100), 0);

  // 2. Receita do Mês -> Faturas pagas neste mês
  const paidInvoices = await prisma.invoice.findMany({
    where: {
      status: "PAID",
      paidAt: { gte: startOfMonth },
    },
  });
  const revenueThisMonth = paidInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0);

  // 3. Inadimplência -> Faturas vencidas
  const overdueInvoices = await prisma.invoice.findMany({
    where: { status: "OVERDUE" },
  });
  const overdueAmount = overdueInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0);

  // 4. Lojas Novas no Mês
  const newTenantsCount = await prisma.tenant.count({
    where: { createdAt: { gte: startOfMonth } },
  });

  // 5. Churn -> Assinaturas Canceladas
  const canceledCount = await prisma.subscription.count({
    where: { status: "CANCELED" },
  });

  return {
    mrr,
    revenueThisMonth,
    overdueAmount,
    newTenantsCount,
    canceledCount,
  };
}

// Action para popular banco com dados fictícios para vermos no painel
export async function seedDummyInvoices() {
  await requirePlatformAdmin();

  // Deletar faturas antigas
  await prisma.invoice.deleteMany({});

  const subscriptions = await prisma.subscription.findMany({
    include: { plan: true, tenant: true },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

  for (const sub of subscriptions) {
    if (!sub.plan) continue;

    // plan.priceMonthly está em centavos, então dividimos por 100 para o Decimal(10, 2)
    const exactAmount = sub.plan.priceMonthly / 100;

    // Fatura do Mês Passado (Paga)
    await prisma.invoice.create({
      data: {
        tenantId: sub.tenantId,
        subscriptionId: sub.id,
        amount: exactAmount,
        status: "PAID",
        dueDate: lastMonth,
        paidAt: new Date(lastMonth.getTime() + 86400000 * 2), // Pago 2 dias depois
      }
    });

    if (sub.status === "ACTIVE") {
      // Fatura deste mês (Paga hoje)
      await prisma.invoice.create({
        data: {
          tenantId: sub.tenantId,
          subscriptionId: sub.id,
          amount: exactAmount,
          status: "PAID",
          dueDate: startOfMonth,
          paidAt: now,
        }
      });
    } else if (sub.status === "PAST_DUE") {
      // Fatura deste mês (Vencida)
      await prisma.invoice.create({
        data: {
          tenantId: sub.tenantId,
          subscriptionId: sub.id,
          amount: exactAmount,
          status: "OVERDUE",
          dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5), // Venceu há 5 dias
        }
      });
    } else if (sub.status === "CANCELED") {
      // Fatura deste mês (Cancelada)
      await prisma.invoice.create({
        data: {
          tenantId: sub.tenantId,
          subscriptionId: sub.id,
          amount: exactAmount,
          status: "CANCELED",
          dueDate: startOfMonth,
        }
      });
    }
  }

  revalidatePath("/admin/finance");
  return { success: true };
}
