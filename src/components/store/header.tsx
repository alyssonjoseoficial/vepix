import Link from "next/link";
import { Search, Settings } from "lucide-react";
import { HeaderCartButton } from "./header-cart-button";

export function StoreHeader({
  store,
  cartCount = 0,
}: {
  store: {
    name: string;
    slug: string;
    primaryColor: string;
    logoUrl?: string | null;
  };
  cartCount?: number;
}) {
  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl"
      style={{ backgroundColor: `${store.primaryColor}ee` }}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Lado Esquerdo: Logo */}
        <Link href={`/${store.slug}`} className="flex shrink-0 items-center gap-3 text-white">
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logoUrl} alt={store.name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
              {store.name.charAt(0)}
            </div>
          )}
          <span className="hidden sm:inline-block text-lg font-bold">{store.name}</span>
        </Link>

        {/* Centro: Barra de Busca */}
        <form 
          action={`/${store.slug}`} 
          method="GET"
          className="order-3 flex w-full flex-1 items-center md:order-2 md:max-w-xl"
        >
          <div className="relative w-full">
            <input
              type="search"
              name="q"
              placeholder="Buscar produtos..."
              className="peer w-full rounded-full border-0 bg-white/15 py-2 pl-4 pr-10 text-sm text-white placeholder-white/70 outline-none ring-0 transition focus:bg-white focus:text-slate-900 focus:placeholder-slate-400"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white peer-focus:text-slate-500">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Lado Direito: Acesso Dono e Carrinho */}
        <div className="order-2 flex shrink-0 items-center gap-2 md:order-3">
          <Link
            href="/login"
            title="Acesso Lojista (Painel)"
            className="flex h-10 items-center gap-2 rounded-full bg-white/15 px-4 text-sm font-medium text-white transition hover:bg-white/25"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden lg:inline">Painel</span>
          </Link>

          <HeaderCartButton storeSlug={store.slug} />
        </div>
      </div>
    </header>
  );
}
