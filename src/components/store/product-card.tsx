"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/components/store/cart-context";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";

export function ProductCard({
  product,
  storeSlug,
  primaryColor,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    price: { toString(): string } | number | string;
    imageUrl?: string | null;
    comparePrice?: { toString(): string } | number | string | null;
    featured?: boolean;
    stock?: number;
    freeShipping?: boolean;
  };
  storeSlug: string;
  primaryColor: string;
}) {
  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const { addItem } = useCart();
  const router = useRouter();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the product page
    e.stopPropagation();
    if (product.stock === 0) return;
    
    addItem(
      {
        productId: product.id,
        name: product.name,
        price,
        imageUrl: product.imageUrl || undefined,
        freeShipping: product.freeShipping,
      },
      1
    );
    router.push(`/${storeSlug}/carrinho`);
  };

  return (
    <Link
      href={`/${storeSlug}/produto/${product.id}`}
      className="group relative flex flex-col overflow-hidden bg-white transition-all duration-200 border border-slate-100 hover:border-slate-300 hover:shadow-md h-full"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-300">
            <ShoppingBag className="mb-1 h-6 w-6 opacity-30" />
          </div>
        )}

        {/* Badges - Compactas */}
        <div className="absolute left-1 top-1 flex flex-col gap-1">
          {product.featured && (
            <span className="bg-[#ee4d2d] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Destaque
            </span>
          )}
          {product.freeShipping && (
            <span className="bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Frete Grátis
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Esgotado
            </span>
          )}
        </div>

        {/* Quick Add Overlay - Ícone no canto */}
        <div className="absolute bottom-2 right-2 translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-md hover:scale-110 disabled:opacity-50"
            title="Adicionar ao carrinho"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col justify-between p-2">
        <h3 className="line-clamp-2 text-xs leading-tight text-slate-800">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-sm font-bold leading-none" style={{ color: primaryColor }}>
            {formatCurrency(price)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-[10px] text-slate-400 line-through">
              {formatCurrency(comparePrice)}
            </span>
          )}
        </div>
        <div className="mt-1 text-[10px] text-slate-500">
          {product.stock ? `${product.stock} disponíveis` : "Estoque indisponível"}
        </div>
      </div>
    </Link>
  );
}
