"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createCoupon, updateCoupon } from "@/lib/actions/coupons";
import { useRouter } from "next/navigation";

export function CouponForm({ tenantId, editingCoupon }: { tenantId: string, editingCoupon?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [discountType, setDiscountType] = useState(editingCoupon?.discountType || "PERCENTAGE");
  const [active, setActive] = useState(editingCoupon?.active ?? true);
  
  useEffect(() => {
    if (editingCoupon) {
      setDiscountType(editingCoupon.discountType);
      setActive(editingCoupon.active);
    } else {
      setDiscountType("PERCENTAGE");
      setActive(true);
    }
  }, [editingCoupon]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    
    const data = {
      code: formData.get("code"),
      description: formData.get("description"),
      discountType,
      discountValue: formData.get("discountValue"),
      minOrderValue: formData.get("minOrderValue"),
      active,
      maxUses: formData.get("maxUses"),
      expiresAt: formData.get("expiresAt") ? new Date(formData.get("expiresAt") as string).toISOString() : null,
    };

    let result;
    if (editingCoupon) {
      result = await updateCoupon(editingCoupon.id, data);
    } else {
      result = await createCoupon(data);
    }

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/dashboard/coupons");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="code">Código do Cupom</Label>
        <Input id="code" name="code" defaultValue={editingCoupon?.code} placeholder="Ex: BEMVINDO10" required className="uppercase" />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" name="description" defaultValue={editingCoupon?.description || ""} placeholder="Ex: Desconto de primeira compra" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discountType">Tipo de Desconto</Label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="PERCENTAGE">Porcentagem (%)</option>
            <option value="FIXED">Valor Fixo (R$)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="discountValue">Valor do Desconto</Label>
          <Input id="discountValue" name="discountValue" type="number" step="0.01" min="0" defaultValue={editingCoupon?.discountValue || ""} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minOrderValue">Compra Mínima (R$)</Label>
          <Input id="minOrderValue" name="minOrderValue" type="number" step="0.01" min="0" defaultValue={editingCoupon?.minOrderValue || ""} placeholder="Opcional" />
        </div>
        <div>
          <Label htmlFor="maxUses">Limite de Usos Globais</Label>
          <Input id="maxUses" name="maxUses" type="number" min="1" defaultValue={editingCoupon?.maxUses || ""} placeholder="Opcional" />
        </div>
      </div>

      <div>
        <Label htmlFor="expiresAt">Data de Validade</Label>
        <Input id="expiresAt" name="expiresAt" type="date" defaultValue={editingCoupon?.expiresAt ? new Date(editingCoupon.expiresAt).toISOString().split('T')[0] : ""} />
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <input 
          type="checkbox" 
          id="active" 
          checked={active} 
          onChange={(e) => setActive(e.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
        />
        <Label htmlFor="active">Cupom Ativo</Label>
      </div>

      {error && <p className="text-sm text-red-600 font-semibold bg-red-50 p-3 rounded-md">{error}</p>}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Salvando..." : editingCoupon ? "Salvar alterações" : "Criar cupom"}
        </Button>
        {editingCoupon && (
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/coupons")} disabled={loading}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
