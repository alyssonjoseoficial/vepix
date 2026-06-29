import { prisma } from "@/lib/prisma";
import { requireTenantAccess } from "@/lib/tenant";
import { Card, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatOrderStatus } from "@/lib/utils";
import { Package, ShoppingBag, Users, Sparkles } from "lucide-react";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";

export default async function DashboardPage() {
  const { tenant } = await requireTenantAccess();

  const [orders, revenue] = await Promise.all([
    prisma.order.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
    prisma.order.aggregate({
      where: { tenantId: tenant.id, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      _sum: { total: true },
    }),
  ]);

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const recentPaidOrders = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      createdAt: { gte: fourteenDaysAgo }
    },
    select: {
      total: true,
      createdAt: true
    }
  });

  const dailyData: Record<string, number> = {};
  
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = new Intl.DateTimeFormat("pt-BR", { 
      day: '2-digit', 
      month: '2-digit',
      timeZone: "America/Sao_Paulo"
    }).format(d);
    dailyData[dateString] = 0;
  }

  for (const order of recentPaidOrders) {
    const dateString = new Intl.DateTimeFormat("pt-BR", { 
      day: '2-digit', 
      month: '2-digit',
      timeZone: "America/Sao_Paulo"
    }).format(order.createdAt);
    if (dailyData[dateString] !== undefined) {
      dailyData[dateString] += Number(order.total);
    }
  }

  const chartData = Object.entries(dailyData).map(([name, total]) => ({
    name,
    total
  }));

  const stats = [
    { label: "Produtos", value: tenant._count.products, icon: Package },
    { label: "Pedidos", value: tenant._count.orders, icon: ShoppingBag },
    { label: "Clientes", value: tenant._count.customers, icon: Users },
    {
      label: "Receita",
      value: formatCurrency(Number(revenue._sum.total ?? 0)),
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Visão geral</h1>
        <p className="mt-2 text-slate-500">
          Bem-vindo de volta. Sua loja está no ar em{" "}
          <strong>/{tenant.slug}</strong>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardTitle>Receita Diária (Últimos 14 dias)</CardTitle>
          <div className="mt-4">
            <AnalyticsChart 
              data={chartData} 
            />
          </div>
        </Card>
        
        <Card className="col-span-3">
        <CardTitle>Pedidos recentes</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-3 pr-4">Cliente</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Nenhum pedido ainda. Compartilhe sua loja!
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium">{order.customerName}</td>
                    <td className="py-3 pr-4">{formatCurrency(Number(order.total))}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {formatOrderStatus(order.status)}
                      </span>
                    </td>
                    <td className="py-3">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
}
