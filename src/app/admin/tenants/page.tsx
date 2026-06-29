import { requirePlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { getTenantBillingInfo } from "@/lib/billing";
import Link from "next/link";
import { Search } from "lucide-react";

export default async function AdminTenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requirePlatformAdmin();
  const q = (await searchParams).q || "";

  const tenants = await prisma.tenant.findMany({
    where: q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ]
    } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      subscription: { include: { plan: true } },
      settings: true,
      members: {
        where: { role: "STORE_OWNER" },
        include: { user: true }
      },
      _count: {
        select: { products: true }
      }
    }
  });

  const tenantsWithBilling = await Promise.all(
    tenants.map(async (tenant) => ({
      ...tenant,
      billing: await getTenantBillingInfo(tenant.id)
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lojas Cadastradas</h1>
          <p className="mt-2 text-sm text-slate-500">Gerencie todas as lojas virtuais da plataforma.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <form className="relative w-full sm:w-72">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome ou link..."
              className="w-full rounded-md border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </form>
          <Link href="/admin/tenants/new" className="whitespace-nowrap rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            + Cadastrar Loja
          </Link>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b text-slate-500">
                <th className="px-6 py-4 font-medium">Nome da Loja</th>
                <th className="px-6 py-4 font-medium">Dono (Responsável)</th>
                <th className="px-6 py-4 font-medium">Plano</th>
                <th className="px-6 py-4 font-medium">Produtos</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tenantsWithBilling.map((tenant) => {
                const owner = tenant.members[0]?.user;
                return (
                  <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{tenant.name}</div>
                      <a href={`/loja/${tenant.slug}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                        /loja/{tenant.slug}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900">{owner?.name || "Desconhecido"}</div>
                      <div className="text-xs text-slate-500">{owner?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {tenant.subscription?.plan?.name || "Sem Plano"}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {tenant._count.products} {tenant.subscription?.plan?.maxProducts ? `/ ${tenant.subscription.plan.maxProducts}` : ""}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {!tenant.active ? (
                          <span className="w-fit inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            Bloqueio Admin
                          </span>
                        ) : tenant.billing.status === "TRIAL" ? (
                          <span className="w-fit inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            Trial ({tenant.billing.daysRemaining} dias)
                          </span>
                        ) : tenant.billing.status === "ACTIVE" ? (
                          <span className="w-fit inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            Ativa (Pago)
                          </span>
                        ) : (
                          <span className="w-fit inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            Vencida / Suspensa
                          </span>
                        )}
                        {tenant.billing.status !== "BLOCKED" && (
                           <span className="text-xs text-slate-500 mt-1">
                             Venc.: {tenant.billing.status === "TRIAL" 
                               ? tenant.billing.trialEndsAt.toLocaleDateString("pt-BR") 
                               : tenant.billing.currentPeriodEnd 
                                 ? tenant.billing.currentPeriodEnd.toLocaleDateString("pt-BR") 
                                 : "-"}
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/tenants/${tenant.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-900">
                        Ficha Completa &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma loja encontrada.
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
