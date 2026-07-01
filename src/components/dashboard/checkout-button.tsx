"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { processSaaSPayment } from "@/lib/actions/billing";
import { Payment, initMercadoPago } from "@mercadopago/sdk-react";

export function CheckoutButton({ planId, price, mpPublicKey, email }: { planId: string, price: number, mpPublicKey: string, email?: string }) {
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CARD">("PIX");
  const [pixData, setPixData] = useState<{ qrCodeBase64?: string, qrCode?: string } | null>(null);

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

  async function generatePix() {
    setLoading(true);
    try {
      const result = await processSaaSPayment(planId, price, { isDirectPix: true, email });
      if (result.error) {
        alert(result.error);
      } else {
        setPixData({
          qrCodeBase64: result.qrCodeBase64,
          qrCode: result.qrCode
        });
      }
    } catch (error) {
      alert("Erro inesperado ao gerar PIX.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopyPix() {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      alert("Código PIX copiado!");
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
                onClick={() => { setShowPayment(false); setPixData(null); }}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {!pixData ? (
                <>
                  <div className="mb-4 flex gap-4 justify-center">
                    <label className={`flex flex-col items-center gap-2 cursor-pointer p-4 border rounded-xl hover:bg-slate-50 transition-colors w-1/2 text-center ${paymentMethod === "PIX" ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>
                      <input type="radio" name="paymentMethod" value="PIX" checked={paymentMethod === "PIX"} onChange={() => setPaymentMethod("PIX")} className="hidden" />
                      <span className="font-bold text-lg">PIX</span>
                      <span className="text-xs text-slate-500">Aprovação imediata</span>
                    </label>
                    <label className={`flex flex-col items-center gap-2 cursor-pointer p-4 border rounded-xl hover:bg-slate-50 transition-colors w-1/2 text-center ${paymentMethod === "CARD" ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>
                      <input type="radio" name="paymentMethod" value="CARD" checked={paymentMethod === "CARD"} onChange={() => setPaymentMethod("CARD")} className="hidden" />
                      <span className="font-bold text-lg">Cartão</span>
                      <span className="text-xs text-slate-500">Crédito / Débito</span>
                    </label>
                  </div>

                  {paymentMethod === "PIX" ? (
                    <Button onClick={generatePix} disabled={loading} className="w-full h-12 text-lg">
                      {loading ? "Gerando PIX..." : `Gerar PIX — R$ ${(price / 100).toFixed(2).replace('.', ',')}`}
                    </Button>
                  ) : (
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
                        },
                        visual: {
                          hideFormTitle: true,
                          hidePaymentButton: false,
                        }
                      }}
                      onSubmit={handlePaymentSubmit}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-6 flex flex-col items-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Escaneie o QR Code</h3>
                  <p className="text-sm text-slate-500 mb-6">Abra o app do seu banco e escaneie o código abaixo para ativar sua assinatura.</p>
                  
                  {pixData.qrCodeBase64 && (
                    <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm mb-6 inline-block">
                      <img 
                        src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`} 
                        alt="PIX QR Code" 
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                  )}

                  <div className="w-full">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Ou copie o código PIX Copia e Cola:</p>
                    <div className="flex w-full mt-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={pixData.qrCode}
                        className="flex-1 bg-slate-100 p-3 rounded-l-lg text-xs font-mono text-slate-600 border border-slate-200 outline-none"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <Button onClick={handleCopyPix} className="rounded-l-none h-auto px-6">
                        Copiar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-sm text-slate-500">
                    Assim que o pagamento for concluído, <br/><button onClick={() => window.location.reload()} className="text-blue-600 font-bold underline">clique aqui para atualizar a página</button>.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
