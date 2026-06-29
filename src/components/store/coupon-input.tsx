"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateCoupon } from "@/lib/actions/checkout-coupons";
import { useCart } from "./cart-context";
import { formatCurrency } from "@/lib/utils";
import { Tag, X } from "lucide-react";

export function CouponInput({ storeSlug }: { storeSlug: string }) {
  const { total, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code) return;
    
    setLoading(true);
    setError("");
    
    const result = await validateCoupon(storeSlug, code, total);
    
    if (result.error) {
      setError(result.error);
    } else if (result.coupon) {
      applyCoupon(result.coupon as any);
      setCode("");
    }
    
    setLoading(false);
  }

  if (appliedCoupon) {
    return (
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800">
            <Tag className="h-4 w-4" />
            <span className="font-semibold text-sm">Cupom aplicado: {appliedCoupon.code}</span>
          </div>
          <button 
            type="button"
            onClick={removeCoupon}
            className="text-emerald-600 hover:text-emerald-800 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-emerald-700 mt-1">
          {appliedCoupon.discountType === "PERCENTAGE" 
            ? `Você ganhou ${appliedCoupon.discountValue}% de desconto.` 
            : `Você ganhou ${formatCurrency(appliedCoupon.discountValue)} de desconto.`}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleApply} className="flex gap-2">
        <Input 
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Código do cupom" 
          className="uppercase"
        />
        <Button type="submit" variant="secondary" disabled={loading || !code}>
          {loading ? "..." : "Aplicar"}
        </Button>
      </form>
      {error && <p className="text-xs text-red-500 font-medium mt-2">{error}</p>}
    </div>
  );
}
