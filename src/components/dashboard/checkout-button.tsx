"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/lib/actions/billing";
import { Wallet, initMercadoPago } from "@mercadopago/sdk-react";

export function CheckoutButton({ planId, price }: { planId: string, price: number }) {
  const [loading, setLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) {
      initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, { locale: "pt-BR" });
    }
  }, []);

  async function handleCheckout() {
    setLoading(true);
    try {
      const data = await createCheckoutSession(planId, price);
      if (data && data.id) {
        // We will use the Wallet component if public key is available, else redirect
        if (process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) {
          setPreferenceId(data.id);
        } else if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      alert("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (preferenceId) {
    return (
      <div className="w-full mt-auto">
        <Wallet initialization={{ preferenceId }} />
      </div>
    );
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

