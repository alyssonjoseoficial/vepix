"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/store/cart-context";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function OrderSuccessClient({ orderStatus, paymentMethod }: { orderStatus: string; paymentMethod: string }) {
  const { clearCart } = useCart();
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    // Se não for PIX ou se já estiver PAGO/ENVIADO, esvazia automaticamente
    if (paymentMethod !== "PIX" || orderStatus !== "PENDING") {
      clearCart();
      setCleared(true);
    }
  }, [orderStatus, paymentMethod, clearCart]);

  if (paymentMethod === "PIX" && orderStatus === "PENDING" && !cleared) {
    return (
      <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <h3 className="text-lg font-bold text-emerald-900 mb-2">Já fez o pagamento?</h3>
        <p className="text-sm text-emerald-800 mb-4">
          Após realizar o PIX, clique no botão abaixo para esvaziar seu carrinho e finalizar.
        </p>
        <Button 
          className="bg-emerald-600 hover:bg-emerald-700 text-white" 
          onClick={() => {
            clearCart();
            setCleared(true);
          }}
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Já Paguei (Esvaziar Carrinho)
        </Button>
      </div>
    );
  }

  return null;
}
