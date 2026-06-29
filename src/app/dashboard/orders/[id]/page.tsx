import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenantAccess } from "@/lib/tenant";
import { Card, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { OrderUpdateForm } from "./order-update-form";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { tenant } = await requireTenantAccess();
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, tenantId: tenant.id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Pedido #{order.id.slice(-8)}</h1>
        <a href="/dashboard/orders" className="text-sm font-semibold text-blue-600 hover:underline">
          &larr; Voltar para pedidos
        </a>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <CardTitle className="mb-4">Detalhes do Cliente</CardTitle>
          <div className="space-y-2 text-sm text-slate-700">
            <p><strong>Nome:</strong> {order.customerName}</p>
            <p><strong>E-mail:</strong> {order.customerEmail}</p>
            <p><strong>Telefone:</strong> {order.customerPhone || "Não informado"}</p>
          </div>

          <CardTitle className="mt-8 mb-4">Endereço de Entrega</CardTitle>
          <div className="space-y-2 text-sm text-slate-700">
            <p>{order.shippingAddress || "Endereço não informado."}</p>
            <p><strong>CEP:</strong> {order.shippingZipCode || "N/A"}</p>
          </div>
        </Card>

        <Card className="p-6">
          <CardTitle className="mb-4">Atualizar Envio</CardTitle>
          <OrderUpdateForm 
            order={{
              id: order.id,
              status: order.status,
              trackingCode: order.trackingCode,
              estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null,
            }} 
          />
        </Card>

        <Card className="p-6 md:col-span-2">
          <CardTitle className="mb-4">Itens do Pedido</CardTitle>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between border-b pb-2 text-sm">
                <span>{item.quantity}x {item.productName}</span>
                <span className="font-semibold">{formatCurrency(Number(item.unitPrice) * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 text-lg font-bold">
              <span>Total Pago ({order.paymentMethod})</span>
              <span>{formatCurrency(Number(order.total))}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
