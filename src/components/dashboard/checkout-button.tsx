"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/lib/actions/billing";

export function CheckoutButton({ planId, price }: { planId: string, price: number }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const url = await createCheckoutSession(planId, price);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      alert("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={loading}
      className="w-full mt-auto"
    >
      {loading ? "Aguarde..." : "Assinar Agora"}
    </Button>
  );
}
