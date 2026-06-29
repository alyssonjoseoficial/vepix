"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/store/cart-context";
import confetti from "canvas-confetti";
import { formatCurrency } from "@/lib/utils";

interface FreeShippingProgressProps {
  minAmount?: any;
}

export function FreeShippingProgress({ minAmount }: FreeShippingProgressProps) {
  const { total, items } = useCart();
  const [hasUnlocked, setHasUnlocked] = useState(false);

  const target = minAmount ? Number(minAmount) : 0;
  
  useEffect(() => {
    if (target > 0 && total >= target && items.length > 0) {
      if (!hasUnlocked) {
        setHasUnlocked(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#facc15', '#3b82f6', '#ef4444', '#22c55e']
        });
      }
    } else if (total < target) {
      setHasUnlocked(false);
    }
  }, [total, target, hasUnlocked, items.length]);

  if (!target || items.length === 0) return null;

  const percentage = Math.min((total / target) * 100, 100);
  const remaining = target - total;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {hasUnlocked ? (
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-600">🎉 Frete Grátis Desbloqueado!</p>
          <p className="text-sm text-emerald-700 mt-1">Seu pedido será entregue sem custo de envio.</p>
        </div>
      ) : (
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-slate-700">Falta {formatCurrency(remaining)} para Frete Grátis</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
