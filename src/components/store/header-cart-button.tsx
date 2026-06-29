"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/store/cart-context";

export function HeaderCartButton({ storeSlug }: { storeSlug: string }) {
  const { count } = useCart();

  return (
    <Link
      href={`/${storeSlug}/carrinho`}
      className="relative flex h-10 items-center gap-2 rounded-full bg-white/15 px-4 text-sm font-medium text-white transition hover:bg-white/25"
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="hidden lg:inline">Carrinho</span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ee4d2d] text-[10px] font-bold text-white shadow-sm border border-white">
          {count}
        </span>
      )}
    </Link>
  );
}
