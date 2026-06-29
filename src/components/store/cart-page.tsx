"use client";

import Link from "next/link";
import { StoreHeader } from "@/components/store/header";
import { CartProvider, useCart } from "@/components/store/cart-context";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Trash2, ArrowLeft, Sparkles } from "lucide-react";
import { FreeShippingProgress } from "@/components/store/free-shipping-progress";
import { useEffect, useState } from "react";
import { getCartRecommendationsAction } from "@/lib/actions/public";
import { ProductCard } from "@/components/store/product-card";

function CartContent({ slug, store }: { slug: string; store: any }) {
  const { items, updateQuantity, removeItem, total } = useCart();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    async function loadRecommendations() {
      if (items.length === 0) {
        setRecommendations([]);
        return;
      }
      setLoadingAi(true);
      try {
        const itemNames = items.map(i => i.name);
        const recs = await getCartRecommendationsAction(slug, itemNames);
        setRecommendations(recs);
      } catch (e) {
        console.error(e);
      }
      setLoadingAi(false);
    }
    
    // Simple debounce to avoid spamming the AI
    const timeout = setTimeout(loadRecommendations, 1000);
    return () => clearTimeout(timeout);
  }, [items, slug]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Carrinho</h1>
      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <p className="text-slate-500">Seu carrinho está vazio.</p>
          <Link href={`/${slug}`}>
            <Button className="mt-4">Continuar comprando</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-100 flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">Sem img</div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{formatCurrency(item.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="rounded-lg border p-2"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="rounded-lg border p-2"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="rounded-lg border p-2 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-6 text-white">
            <span className="text-lg">Total</span>
            <span className="text-2xl font-bold">{formatCurrency(total)}</span>
          </div>
          <FreeShippingProgress minAmount={store?.settings?.freeShippingMinAmount} />
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link href={`/${slug}`} className="flex-1">
              <Button size="lg" variant="outline" className="w-full gap-2 border-slate-300 text-slate-700">
                <ArrowLeft className="h-4 w-4" /> Continuar comprando
              </Button>
            </Link>
            <Link href={`/${slug}/checkout`} className="flex-1">
              <Button size="lg" className="w-full" style={{ backgroundColor: store?.primaryColor }}>
                Finalizar compra
              </Button>
            </Link>
          </div>

          {/* Recomendações por IA */}
          {items.length > 0 && (loadingAi || recommendations.length > 0) && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h3 className="text-xl font-bold text-slate-900">Você também pode gostar</h3>
              </div>
              
              {loadingAi ? (
                <div className="flex items-center justify-center py-10 opacity-50">
                  <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full mr-3"></div>
                  <span className="text-sm text-slate-500">A IA está analisando seu carrinho...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {recommendations.map((product) => (
                    <div key={product.id} className="transform scale-95 origin-top">
                      <ProductCard
                        product={product}
                        storeSlug={slug}
                        primaryColor={store?.primaryColor || "#000"}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StoreCartPage({
  slug,
  store,
}: {
  slug: string;
  store: any;
}) {
  return (
    <CartProvider storeSlug={slug}>
      <div className="min-h-screen bg-slate-50">
        <StoreHeader store={store} />
        <CartContent slug={slug} store={store} />
      </div>
    </CartProvider>
  );
}
