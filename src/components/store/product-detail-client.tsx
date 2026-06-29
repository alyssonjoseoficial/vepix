"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/store/cart-context";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Truck, MapPin } from "lucide-react";

export function ProductDetailClient({
  product,
  primaryColor,
  storeSlug,
}: {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    stock: number;
    freeShipping?: boolean;
  };
  primaryColor: string;
  storeSlug: string;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState("");
  const [shippingResult, setShippingResult] = useState<{pac: string, sedex: string} | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  function handleAdd() {
    if (product.stock <= 0) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        freeShipping: product.freeShipping,
      },
      quantity,
    );
    router.push(`/${storeSlug}/carrinho`);
  }

  function handleCalculateShipping() {
    if (cep.length < 8) return;
    setIsCalculating(true);
    // Simulate network delay
    setTimeout(() => {
      setShippingResult({
        pac: "R$ 25,90 (5 a 7 dias úteis)",
        sedex: "R$ 45,50 (2 a 3 dias úteis)"
      });
      setIsCalculating(false);
    }, 800);
  }

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Simple mask for 00000-000
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 5) {
      val = val.substring(0, 5) + '-' + val.substring(5, 8);
    }
    setCep(val);
  }

  return (
    <div className="flex flex-col gap-6 mt-8">
      {/* Shipping Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {product.freeShipping ? (
          <div className="flex items-center gap-3 text-emerald-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold">Frete Grátis</p>
              <p className="text-xs text-emerald-600/80">Disponível para todo o Brasil</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Calcular Frete</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={handleCepChange}
                maxLength={9}
                className="h-10 w-full flex-1 rounded-xl border border-slate-200 px-3 text-sm focus:border-slate-400 focus:outline-none"
              />
              <Button
                onClick={handleCalculateShipping}
                disabled={isCalculating || cep.length < 9}
                variant="secondary"
                className="h-10 px-4 text-sm"
              >
                {isCalculating ? "Calculando..." : "Calcular"}
              </Button>
            </div>
            
            {shippingResult && (
              <div className="mt-2 rounded-xl bg-slate-50 p-3 space-y-2 text-sm text-slate-700 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium">PAC</span>
                  <span className="text-slate-500">{shippingResult.pac}</span>
                </div>
                <div className="h-px w-full bg-slate-200"></div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Sedex</span>
                  <span className="text-slate-500">{shippingResult.sedex}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
      <input
        type="number"
        min={1}
        max={product.stock}
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
        className="h-11 w-20 rounded-xl border border-slate-200 px-3"
        disabled={product.stock <= 0}
      />
      <Button
        onClick={handleAdd}
        disabled={product.stock <= 0}
        className="gap-2"
        style={{ backgroundColor: primaryColor }}
      >
        <ShoppingCart className="h-4 w-4" />
        {product.stock > 0 ? "Adicionar ao carrinho" : "Esgotado"}
      </Button>
    </div>
    </div>
  );
}
