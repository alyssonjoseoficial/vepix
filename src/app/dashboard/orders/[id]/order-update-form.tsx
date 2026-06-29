"use client";

import { useState } from "react";
import { updateOrderShipping } from "@/lib/actions/store";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function OrderUpdateForm({ order }: { order: any }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("orderId", order.id);
    await updateOrderShipping(formData);
    setLoading(false);
    alert("Pedido atualizado com sucesso!");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status">Status do Pedido</Label>
        <select 
          id="status" 
          name="status" 
          defaultValue={order.status}
          className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="PENDING">Pendente</option>
          <option value="PAID">Pago</option>
          <option value="SHIPPED">Enviado</option>
          <option value="DELIVERED">Entregue</option>
          <option value="CANCELED">Cancelado</option>
        </select>
      </div>

      <div>
        <Label htmlFor="trackingCode">Código de Rastreio</Label>
        <Input 
          id="trackingCode" 
          name="trackingCode" 
          defaultValue={order.trackingCode || ""} 
          placeholder="Ex: BR123456789"
        />
      </div>

      <div>
        <Label htmlFor="estimatedDelivery">Data Prevista de Entrega</Label>
        <Input 
          id="estimatedDelivery" 
          name="estimatedDelivery" 
          type="date" 
          defaultValue={order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : ""}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  );
}
