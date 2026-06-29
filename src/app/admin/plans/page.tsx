import { requirePlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function AdminPlansPage() {
  await requirePlatformAdmin();

  const plans = await prisma.plan.findMany({
    orderBy: { priceMonthly: "asc" },
    include: { _count: { select: { subscriptions: true } } }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Planos de Assinatura</h1>
          <p className="mt-2 text-sm text-slate-500">Gerencie os pacotes que os lojistas podem assinar.</p>
        </div>
        <Link 
          href="/admin/plans/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          + Criar Novo Plano
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b text-slate-500">
                <th className="px-6 py-4 font-medium">Nome do Plano</th>
                <th className="px-6 py-4 font-medium">Mensalidade</th>
                <th className="px-6 py-4 font-medium">Limite de Produtos</th>
                <th className="px-6 py-4 font-medium">Lojas Ativas</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {plan.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatCurrency(plan.priceMonthly / 100)} {/* Convertendo de centavos */}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    Até {plan.maxProducts}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {plan._count.subscriptions} assinantes
                  </td>
                  <td className="px-6 py-4">
                    {plan.active ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/plans/${plan.id}`} className="text-blue-600 hover:text-blue-900 font-medium text-sm">
                      Editar &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhum plano cadastrado. Crie um para começar a faturar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
