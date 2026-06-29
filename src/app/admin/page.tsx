import { requirePlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Store, Users, CreditCard, Activity } from "lucide-react";

export default async function SuperAdminDashboard() {
  await requirePlatformAdmin();

  // Metrics
  const totalTenants = await prisma.tenant.count();
  const activeTenants = await prisma.tenant.count({ where: { active: true } });
  
  const totalSuperAdmins = await prisma.user.count({ 
    where: { role: { in: ["PLATFORM_ADMIN", "PLATFORM_OPERATOR"] } } 
  });

  const totalPlans = await prisma.plan.count({ where: { active: true } });

  const stats = [
    { label: "Lojas Registradas", value: totalTenants, icon: Store },
    { label: "Lojas Ativas", value: activeTenants, icon: Activity },
    { label: "Planos Ativos", value: totalPlans, icon: CreditCard },
    { label: "Membros da Equipe", value: totalSuperAdmins, icon: Users },
  ];

  const recentTenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { subscription: { include: { plan: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Visão Geral da Plataforma</h1>
        <p className="mt-2 text-slate-500">Resumo geral das lojas e saúde do seu SaaS.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-slate-700" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <CardTitle>Últimas Lojas Cadastradas</CardTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-3 pr-4">Loja</th>
                <th className="py-3 pr-4">Subdomínio</th>
                <th className="py-3 pr-4">Plano</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Nenhuma loja cadastrada ainda.
                  </td>
                </tr>
              ) : (
                recentTenants.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium">{t.name}</td>
                    <td className="py-3 pr-4">/loja/{t.slug}</td>
                    <td className="py-3 pr-4">{t.subscription?.plan?.name || "Sem Plano"}</td>
                    <td className="py-3 pr-4">
                      {t.active ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Ativa</span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">Suspensa</span>
                      )}
                    </td>
                    <td className="py-3">
                      {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                    </td>
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
