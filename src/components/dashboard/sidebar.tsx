"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Settings,
  Store,
  CreditCard,
  LogOut,
  TicketPercent,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Produtos", icon: Package },
  { href: "/dashboard/categories", label: "Categorias", icon: Tags },
  { href: "/dashboard/coupons", label: "Cupons", icon: TicketPercent },
  { href: "/dashboard/orders", label: "Pedidos", icon: ShoppingBag },
  { href: "/dashboard/support", label: "Suporte", icon: LifeBuoy },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
  { href: "/dashboard/billing", label: "Assinatura", icon: CreditCard },
];

export function DashboardSidebar({
  storeName,
  storeSlug,
  storeLogo,
  onNavigate,
}: {
  storeName: string;
  storeSlug: string;
  storeLogo?: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-transparent">
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-3">
          {storeLogo ? (
            <img src={storeLogo.startsWith("data:image") ? `/api/public/${storeSlug}/logo` : storeLogo} alt={storeName} className="h-10 w-10 object-contain rounded-md shrink-0 bg-white" />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-sm">
              {storeName.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="truncate text-base font-bold text-slate-900" title={storeName}>{storeName}</h2>
        </div>
        <Link
          href={`/${storeSlug}`}
          target="_blank"
          className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          <Store className="h-4 w-4" />
          Ver loja
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
              pathname === href
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-100 p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 mb-4 transition"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
        <div className="flex flex-col items-center justify-center opacity-60 pointer-events-none">
           <span className="text-[10px] text-slate-400 mb-1.5 font-medium uppercase tracking-wider">Powered by</span>
           <img src="/vepix_logo.png" alt="VePix" className="h-5 w-auto grayscale" />
        </div>
      </div>
    </aside>
  );
}
