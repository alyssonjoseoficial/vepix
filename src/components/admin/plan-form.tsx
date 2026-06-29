"use client";

import { useState } from "react";
import { upsertPlan } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function PlanForm({ plan = null }: { plan?: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (plan) formData.set("id", plan.id);
    
    await upsertPlan(formData);
    
    setLoading(false);
    router.push("/admin/plans");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Nome do Plano</Label>
          <Input id="name" name="name" defaultValue={plan?.name} required placeholder="Ex: Pro, Basic, Enterprise" />
        </div>

        <div>
          <Label htmlFor="priceMonthly">Preço Mensal (R$)</Label>
          <Input 
            id="priceMonthly" 
            name="priceMonthly" 
            type="number" 
            step="0.01" 
            min="0"
            defaultValue={plan ? (plan.priceMonthly / 100).toFixed(2) : ""} 
            required 
            placeholder="Ex: 99.90"
          />
          <p className="mt-1 text-xs text-slate-500">Use 0 para planos gratuitos.</p>
        </div>

        <div>
          <Label htmlFor="maxProducts">Limite de Produtos</Label>
          <Input 
            id="maxProducts" 
            name="maxProducts" 
            type="number" 
            min="1"
            defaultValue={plan?.maxProducts ?? 100} 
            required 
          />
          <p className="mt-1 text-xs text-slate-500">Quantos produtos a loja pode cadastrar.</p>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Descrição / Benefícios</Label>
          <Textarea 
            id="description" 
            name="description" 
            defaultValue={plan?.description ?? ""} 
            placeholder="Liste os benefícios separados por vírgula..."
            rows={3}
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-2">
          <input 
            type="checkbox" 
            id="active" 
            name="active" 
            defaultChecked={plan ? plan.active : true} 
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
          />
          <Label htmlFor="active" className="cursor-pointer">Plano Ativo (Disponível para assinatura)</Label>
        </div>
      </div>

      <div className="pt-4 border-t flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? "Salvando..." : "Salvar Plano"}
        </Button>
      </div>
    </form>
  );
}
