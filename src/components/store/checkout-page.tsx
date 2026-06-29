"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StoreHeader } from "@/components/store/header";
import { CartProvider, useCart } from "@/components/store/cart-context";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { processPayment } from "@/lib/actions/payments";
import { FreeShippingProgress } from "@/components/store/free-shipping-progress";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { useEffect } from "react";
import { CouponInput } from "@/components/store/coupon-input";

function CheckoutForm({
  slug,
  pixKey,
  store,
}: {
  slug: string;
  pixKey?: string | null;
  store?: any;
}) {
  const { items, total, clearCart, appliedCoupon } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cep, setCep] = useState("");
  const [shippingResult, setShippingResult] = useState<{pac: number, sedex: number} | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<{method: string, cost: number} | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CARD">("PIX");

  useEffect(() => {
    if (store?.settings?.mpPublicKey) {
      initMercadoPago(store.settings.mpPublicKey, { locale: "pt-BR" });
    }
  }, [store]);

  const allItemsFreeShipping = items.length > 0 && items.every((i) => i.freeShipping);
  const storeFreeShippingMin = store?.settings?.freeShippingMinAmount ? Number(store.settings.freeShippingMinAmount) : null;
  const qualifiesForStoreFreeShipping = storeFreeShippingMin !== null && total >= storeFreeShippingMin;
  const isFreeShipping = allItemsFreeShipping || qualifiesForStoreFreeShipping;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      discountAmount = (total * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const finalTotal = Math.max(0, total + (isFreeShipping || !selectedShipping ? 0 : selectedShipping.cost) - discountAmount);

  function handleContinueToPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!items.length) return;
    if (!isFreeShipping && !selectedShipping) {
      setError("Por favor, selecione uma opção de frete.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      customerName: String(formData.get("customerName")),
      customerEmail: String(formData.get("customerEmail")),
      customerPhone: String(formData.get("customerPhone")),
      shippingZipCode: String(formData.get("shippingZipCode")),
      shippingState: String(formData.get("shippingState")),
      shippingCity: String(formData.get("shippingCity")),
      shippingNeighborhood: String(formData.get("shippingNeighborhood")),
      shippingAddress: `${formData.get("shippingAddress")}, ${formData.get("shippingComplement")}`,
      cart: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      shippingCost: isFreeShipping || !selectedShipping ? 0 : selectedShipping.cost,
      shippingMethod: isFreeShipping || !selectedShipping ? "" : selectedShipping.method,
      paymentMethod,
      couponId: appliedCoupon?.id,
      discountAmount,
    };

    setOrderData(data);

    if (paymentMethod === "PIX") {
      handlePaymentSubmit({ isDirectPix: true }, data);
    } else {
      setStep(2);
    }
  }

  async function handlePaymentSubmit(param: any, overrideOrderData?: any) {
    setLoading(true);
    setError("");

    const currentOrderData = overrideOrderData || orderData;

    // Prevent serialization errors by converting to a plain object
    const plainParam = JSON.parse(JSON.stringify({
      isDirectPix: param.isDirectPix,
      formData: param.formData,
      additionalData: param.additionalData
    }));

    const result = await processPayment(slug, plainParam, currentOrderData);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    clearCart();
    router.push(`/loja/${slug}/pedido/${result.orderId}`);
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-slate-500">Carrinho vazio.</p>
        <Link href={`/loja/${slug}`}>
          <Button className="mt-4">Voltar à loja</Button>
        </Link>
      </div>
    );
  }

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 5) {
      val = val.substring(0, 5) + '-' + val.substring(5, 8);
    }
    setCep(val);

    if (val.length === 9 && !isFreeShipping) {
      setIsCalculating(true);
      setTimeout(() => {
        setShippingResult({
          pac: 25.90,
          sedex: 45.50
        });
        setSelectedShipping({ method: "PAC", cost: 25.90 });
        setIsCalculating(false);
      }, 800);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2">
      {step === 1 ? (
      <form onSubmit={handleContinueToPayment} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Finalizar compra</h1>
        <div>
          <Label htmlFor="customerName">Nome completo</Label>
          <Input id="customerName" name="customerName" required />
        </div>
        <div>
          <Label htmlFor="customerEmail">E-mail</Label>
          <Input id="customerEmail" name="customerEmail" type="email" required />
        </div>
        <div>
          <Label htmlFor="customerPhone">Telefone</Label>
          <Input id="customerPhone" name="customerPhone" />
        </div>

        <hr className="my-6 border-slate-200" />
        
        <h2 className="text-lg font-bold">Endereço de Entrega</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="shippingZipCode">CEP</Label>
            <Input 
              id="shippingZipCode" 
              name="shippingZipCode" 
              placeholder="00000-000" 
              value={cep}
              onChange={handleCepChange}
              maxLength={9}
              required 
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="shippingState">Estado</Label>
            <Input id="shippingState" name="shippingState" placeholder="Ex: SP" required />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="shippingCity">Cidade</Label>
            <Input id="shippingCity" name="shippingCity" required />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="shippingNeighborhood">Bairro</Label>
            <Input id="shippingNeighborhood" name="shippingNeighborhood" required />
          </div>
          <div className="col-span-2">
            <Label htmlFor="shippingAddress">Rua / Avenida e Número</Label>
            <Input id="shippingAddress" name="shippingAddress" placeholder="Ex: Rua das Flores, 123" required />
          </div>
          <div className="col-span-2">
            <Label htmlFor="shippingComplement">Complemento (Opcional)</Label>
            <Input id="shippingComplement" name="shippingComplement" placeholder="Ex: Apto 42, Bloco B" />
          </div>
        </div>

        {isFreeShipping ? (
          <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-2">
            <span className="font-bold">Frete Grátis</span> — Prazo estimado: 7 a 10 dias úteis.
          </div>
        ) : shippingResult ? (
          <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-800">Opções de Entrega</h3>
            <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors" style={{ borderColor: selectedShipping?.method === "PAC" ? store?.primaryColor || '#ee4d2d' : '#e2e8f0' }}>
              <div className="flex items-center gap-3">
                <input type="radio" name="shippingMethodForm" value="PAC" checked={selectedShipping?.method === "PAC"} onChange={() => setSelectedShipping({ method: "PAC", cost: shippingResult.pac })} className="h-4 w-4" />
                <div>
                  <p className="font-semibold text-sm">PAC</p>
                  <p className="text-xs text-slate-500">5 a 7 dias úteis</p>
                </div>
              </div>
              <span className="font-bold">{formatCurrency(shippingResult.pac)}</span>
            </label>
            <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors" style={{ borderColor: selectedShipping?.method === "Sedex" ? store?.primaryColor || '#ee4d2d' : '#e2e8f0' }}>
              <div className="flex items-center gap-3">
                <input type="radio" name="shippingMethodForm" value="Sedex" checked={selectedShipping?.method === "Sedex"} onChange={() => setSelectedShipping({ method: "Sedex", cost: shippingResult.sedex })} className="h-4 w-4" />
                <div>
                  <p className="font-semibold text-sm">Sedex</p>
                  <p className="text-xs text-slate-500">2 a 3 dias úteis</p>
                </div>
              </div>
              <span className="font-bold">{formatCurrency(shippingResult.sedex)}</span>
            </label>
          </div>
        ) : isCalculating ? (
          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 animate-pulse">
            Calculando frete...
          </div>
        ) : (
          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Digite seu CEP completo para calcular o frete.
          </div>
        )}

        <hr className="my-6 border-slate-200" />

        <div>
          <Label>Método de pagamento</Label>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 transition-colors" style={{ borderColor: paymentMethod === "PIX" ? store?.primaryColor || '#ee4d2d' : '#e2e8f0' }}>
              <input type="radio" name="paymentMethod" value="PIX" checked={paymentMethod === "PIX"} onChange={() => setPaymentMethod("PIX")} className="h-4 w-4" />
              <span className="font-semibold text-sm">PIX (Aprovação Imediata)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 transition-colors" style={{ borderColor: paymentMethod === "CARD" ? store?.primaryColor || '#ee4d2d' : '#e2e8f0' }}>
              <input type="radio" name="paymentMethod" value="CARD" checked={paymentMethod === "CARD"} onChange={() => setPaymentMethod("CARD")} className="h-4 w-4" />
              <span className="font-semibold text-sm">Cartão de Crédito</span>
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 font-semibold bg-red-50 p-3 rounded-md">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || (!isFreeShipping && !selectedShipping)}>
          {loading ? "Processando..." : paymentMethod === "PIX" ? `Confirmar Pagamento PIX — ${formatCurrency(finalTotal)}` : "Continuar para Cartão"}
        </Button>
      </form>
      ) : (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" onClick={() => setStep(1)} disabled={loading}>
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Pagamento</h1>
        </div>
        
        {store?.settings?.mpPublicKey ? (
          <Payment
            initialization={{ 
              amount: finalTotal,
              payer: {
                email: orderData?.customerEmail
              }
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
        ) : (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            A loja não configurou a chave pública do Mercado Pago.
          </div>
        )}
        {error && <p className="text-sm text-red-600 font-semibold bg-red-50 p-3 rounded-md">{error}</p>}
        {loading && <p className="text-sm text-slate-500 text-center animate-pulse">Processando pagamento, aguarde...</p>}
      </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Resumo</h2>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded bg-slate-100 flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[8px] text-slate-400">Sem img</div>
                  )}
                </div>
                <span>
                  {item.name} x{item.quantity}
                </span>
              </div>
              <span className="font-medium text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-slate-100 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Frete</span>
            {isFreeShipping ? (
              <span className="text-emerald-600 font-bold">Grátis</span>
            ) : (
              <span>{selectedShipping ? formatCurrency(selectedShipping.cost) : "A calcular"}</span>
            )}
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Desconto</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
          <span>Total</span>
          <span style={{ color: store?.primaryColor }}>{formatCurrency(finalTotal)}</span>
        </div>
        <CouponInput storeSlug={slug} />
        <div className="mt-4">
          <FreeShippingProgress minAmount={store?.settings?.freeShippingMinAmount} />
        </div>
      </div>
    </div>
  );
}

export function StoreCheckoutPage({
  slug,
  store,
  pixKey,
}: {
  slug: string;
  store: any;
  pixKey?: string | null;
}) {
  return (
    <CartProvider storeSlug={slug}>
      <div className="min-h-screen bg-slate-50">
        <StoreHeader store={store} />
        <CheckoutForm slug={slug} pixKey={pixKey} store={store} />
      </div>
    </CartProvider>
  );
}
