"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { processSaaSPayment } from "@/lib/actions/billing";
import { Payment, initMercadoPago } from "@mercadopago/sdk-react";

export function CheckoutButton({ planId, price }: { planId: string, price: number }) {
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) {
      initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, { locale: "pt-BR" });
    }
  }, []);

  async function handlePaymentSubmit(param: any) {
    setLoading(true);
    try {
      const plainParam = JSON.parse(JSON.stringify(param));
      const result = await processSaaSPayment(planId, price, plainParam);
      
      if (result.error) {
        alert(result.error);
      } else {
        alert("Assinatura confirmada com sucesso! Atualizando...");
        window.location.reload();
      }
    } catch (error) {
      alert("Erro inesperado ao processar pagamento.");
    } finally {
      setLoading(false);
    }
  }

  if (showPayment) {
    return (
      <div className="w-full mt-auto bg-white p-4 rounded-xl border border-slate-200">
        <Payment
          initialization={{ 
            amount: Number((price / 100).toFixed(2)),
          }}
          customization={{
            paymentMethods: {
              ticket: "all",
              bankTransfer: "all",
              creditCard: "all",
              debitCard: "all",
              mercadoPago: "all",
            },
            visual: {
              hideFormTitle: true,
              hidePaymentButton: false,
            }
          }}
          onSubmit={handlePaymentSubmit}
        />
        <Button 
          variant="ghost" 
          className="w-full mt-4" 
          onClick={() => setShowPayment(false)}
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={() => setShowPayment(true)} 
      disabled={loading || !process.env.NEXT_PUBLIC_MP_PUBLIC_KEY}
      className="w-full mt-auto"
    >
      {process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ? "Assinar Agora" : "Configuração MP Pendente"}
    </Button>
  );
}

