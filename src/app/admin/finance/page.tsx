export const dynamic = "force-dynamic";

import { requirePlatformAdmin } from "@/lib/admin";
import { getFinancialMetrics, seedDummyInvoices } from "@/lib/actions/finance";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, CheckCircle, AlertTriangle, UserX, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminFinancePage() {
  await requirePlatformAdmin();
  
  const metrics = await getFinancialMetrics();

  // Temporary fix for exorbitant invoice amounts created by the previous seed bug
  const buggedInvoices = await prisma.invoice.findMany({ where: { amount: { gt: 1000 } } });
  if (buggedInvoices.length > 0) {
    for (const inv of buggedInvoices) {
      await prisma.invoice.update({
        where: { id: inv.id },
        data: { amount: Number(inv.amount) / 100 }
      });
    }
    // Re-fetch metrics if we changed something
    return <div className="p-8 text-center"><p className="text-xl">Corrigindo faturas exorbitantes... Por favor, aperte F5 mais uma vez!</p></div>;
  }

  const recentInvoices = await prisma.invoice.findMany({
    where: { status: "PAID" },
    orderBy: { paidAt: "desc" },
    take: 5,
    include: { tenant: true, subscription: { include: { plan: true } } },
  });

  const overdueInvoices = await prisma.invoice.findMany({
    where: { status: "OVERDUE" },
    orderBy: { dueDate: "asc" },
    include: { tenant: true, subscription: { include: { plan: true } } },
  });

  const canceledSubscriptions = await prisma.subscription.findMany({
    where: { status: "CANCELED" },
    orderBy: { updatedAt: "desc" },
    include: { tenant: true, plan: true },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Financeiro</h1>
          <p className="mt-2 text-slate-500">Controle de Faturas, Receita Recorrente e Inadimplência.</p>
        </div>
        <form action={seedDummyInvoices}>
          <Button variant="outline" className="gap-2 bg-white" title="Gerar faturas baseadas nas assinaturas atuais">
            <Plus className="h-4 w-4" />
            Gerar Faturas (Seed)
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-6 border-blue-100 bg-blue-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">MRR (Previsão)</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(metrics.mrr)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-emerald-100 bg-emerald-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600">Recebido no Mês</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(metrics.revenueThisMonth)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-red-100 bg-red-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-600">Inadimplência</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(metrics.overdueAmount)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Churn (Cancelados)</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.canceledCount} lojas</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <UserX className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="flex flex-col">
          <div className="p-6 pb-2 border-b border-slate-100">
            <CardTitle>Inadimplentes (OVERDUE)</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Lojas com faturas vencidas aguardando pagamento.</p>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr className="text-slate-500">
                  <th className="px-6 py-3 font-medium">Loja</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="px-6 py-3 font-medium">Vencimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Nenhum inadimplente.</td>
                  </tr>
                ) : (
                  overdueInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-6 py-4 font-medium text-slate-900">{inv.tenant.name}</td>
                      <td className="px-6 py-4 font-bold text-red-600">{formatCurrency(Number(inv.amount))}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="p-6 pb-2 border-b border-slate-100">
            <CardTitle>Últimos Recebimentos</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Faturas que foram pagas recentemente.</p>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr className="text-slate-500">
                  <th className="px-6 py-3 font-medium">Loja</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="px-6 py-3 font-medium">Data do Pagamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Nenhum recebimento.</td>
                  </tr>
                ) : (
                  recentInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-6 py-4 font-medium text-slate-900">{inv.tenant.name}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(Number(inv.amount))}</td>
                      <td className="px-6 py-4 text-slate-500">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString("pt-BR") : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6 pb-2 border-b border-slate-100">
          <CardTitle>Controle de Churn (Cancelamentos)</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Assinaturas que não estão mais ativas no sistema.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="text-slate-500">
                <th className="px-6 py-3 font-medium">Loja</th>
                <th className="px-6 py-3 font-medium">Plano Anterior</th>
                <th className="px-6 py-3 font-medium">Data do Cancelamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {canceledSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Nenhum cancelamento registrado.</td>
                </tr>
              ) : (
                canceledSubscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4 font-medium text-slate-900">{sub.tenant.name}</td>
                    <td className="px-6 py-4 text-slate-500">{sub.plan.name}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(sub.updatedAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
