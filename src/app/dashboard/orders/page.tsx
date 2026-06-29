import { prisma } from "@/lib/prisma";
import { requireTenantAccess } from "@/lib/tenant";
import { Card, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatOrderStatus } from "@/lib/utils";

export default async function OrdersPage() {
  const { tenant } = await requireTenantAccess();
  const orders = await prisma.order.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Pedidos</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-3 pr-4">#</th>
                <th className="py-3 pr-4">Cliente</th>
                <th className="py-3 pr-4">Itens</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Pagamento</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="py-3 pr-4 font-mono text-xs">
                    <a href={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:underline">
                      {order.id.slice(-8)}
                    </a>
                  </td>
                  <td className="py-3 pr-4">
                    <a href={`/dashboard/orders/${order.id}`} className="block">
                      <p className="font-medium text-slate-900 hover:text-blue-600">{order.customerName}</p>
                      <p className="text-slate-500">{order.customerEmail}</p>
                    </a>
                  </td>
                  <td className="py-3 pr-4">{order.items.length}</td>
                  <td className="py-3 pr-4">{formatCurrency(Number(order.total))}</td>
                  <td className="py-3 pr-4">{order.paymentMethod ?? "—"}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {formatOrderStatus(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
