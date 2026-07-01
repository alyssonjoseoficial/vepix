"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { processSaaSPayment } from "@/lib/actions/billing";
import { Payment, initMercadoPago } from "@mercadopago/sdk-react";

export function CheckoutButton({ planId, price, mpPublicKey, email }: { planId: string, price: number, mpPublicKey: string, email?: string }) {
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (mpPublicKey) {
      initMercadoPago(mpPublicKey, { locale: "pt-BR" });
    }
  }, [mpPublicKey]);

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

  return (
    <>
      <Button 
        onClick={() => setShowPayment(true)} 
        disabled={loading || !mpPublicKey}
        className="w-full mt-auto"
      >
        {mpPublicKey ? "Assinar Agora" : "Configuração MP Pendente"}
      </Button>

      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg">Finalizar Pagamento</h3>
              <button 
                onClick={() => setShowPayment(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <Payment
                initialization={{ 
                  amount: Number((price / 100).toFixed(2)),
                  payer: email ? { email } : undefined,
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
            </div>
          </div>
        </div>
      )}
    </>
  );

}

