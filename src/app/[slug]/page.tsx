import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoreHeader } from "@/components/store/header";
import { ProductCard } from "@/components/store/product-card";
import { CartProvider } from "@/components/store/cart-context";
import { MegaOfferCarousel } from "@/components/store/mega-offer-carousel";
import { ActionableBanners } from "@/components/store/actionable-banners";
import { Sparkles, ArrowRight, ShoppingBag, Zap, Tag, Star, Package, TrendingUp, SearchX } from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // Cache de 1 minuto

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ categoria?: string; q?: string; freteGratis?: string }>;
}) {
  const { slug } = await params;
  const { categoria: selectedCategoryId, q: searchQuery, freteGratis } = await searchParams;
  const isSearching = !!searchQuery;
  const isFreeShipping = freteGratis === 'true';

  const getCachedTenant = unstable_cache(
    async (storeSlug: string) => {
      return await prisma.tenant.findUnique({
        where: { slug: storeSlug },
        include: {
          products: { where: { active: true }, orderBy: { createdAt: "desc" } },
          categories: { orderBy: { name: "asc" } },
          settings: true,
        },
      });
    },
    [`tenant-store-data-${slug}`],
    { revalidate: 60 }
  );

  const tenant = await getCachedTenant(slug);

  if (!tenant) notFound();

  // Filtros
  const allProducts = tenant.products;
  const featured = allProducts.filter((p) => p.featured);
  const megaOffers = allProducts.filter((p) => p.isMegaOffer);
  
  // Produtos a exibir na grade principal
  let displayProducts = allProducts;
  if (isFreeShipping) {
    displayProducts = displayProducts.filter((p) => p.freeShipping === true);
  } else if (selectedCategoryId) {
    displayProducts = displayProducts.filter((p) => p.categoryId === selectedCategoryId);
  } else if (!isSearching) {
    displayProducts = displayProducts.filter((p) => !p.featured);
  }

  // Se houver busca, filtra pelo termo de forma inteligente
  if (isSearching) {
    const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const queryNorm = normalize(searchQuery.trim());
    
    // Remove "s" no final para ajudar com plurais simples (ex: "bonecos" -> "boneco")
    const keywords = queryNorm.split(/\s+/).map(k => k.endsWith('s') ? k.slice(0, -1) : k);

    displayProducts = displayProducts.filter(p => {
      const nameNorm = normalize(p.name);
      const descNorm = p.description ? normalize(p.description) : "";
      
      // Encontra o nome da categoria para incluir na busca
      const categoryName = tenant.categories.find(c => c.id === p.categoryId)?.name || "";
      const catNorm = normalize(categoryName);
      
      const searchSpace = `${nameNorm} ${descNorm} ${catNorm}`;
      
      // Verifica se a frase exata bate OU se TODAS as palavras-chave batem
      return searchSpace.includes(queryNorm) || keywords.every(kw => searchSpace.includes(kw));
    });
  }



  // Helpers para serializar objetos do Prisma
  const serializeProduct = (p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    imageUrl: (Array.isArray(p.imageUrls) && p.imageUrls.length > 0) ? String(p.imageUrls[0]) : null,
    featured: p.featured,
    stock: p.stock,
    freeShipping: p.freeShipping,
  });

  const serializeSettings = (s: any) => {
    if (!s) return null;
    return {
      ...s,
      freeShippingMinAmount: s.freeShippingMinAmount ? Number(s.freeShippingMinAmount) : null,
    };
  };

  const categoryIcons = [Tag, Star, Package, TrendingUp, Zap];

  return (
    <CartProvider storeSlug={tenant.slug}>
      <div className="min-h-screen bg-[#f5f5f5] font-sans selection:bg-[#ee4d2d] selection:text-white pb-20">
        <StoreHeader store={tenant} />
        
        {/* BANNERS GRID */}
        {!selectedCategoryId && !isSearching && !isFreeShipping && (
          <section className="mx-auto max-w-7xl px-2 pt-4 sm:px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* Banner Principal */}
              <MegaOfferCarousel 
                products={megaOffers.map(serializeProduct)} 
                tenantName={tenant.name}
                primaryColor={tenant.primaryColor}
                secondaryColor={tenant.secondaryColor || undefined}
                storeSlug={tenant.slug}
              />

              {/* Banners Menores */}
              <ActionableBanners settings={serializeSettings(tenant.settings)} storeSlug={tenant.slug} />
            </div>
          </section>
        )}

        {/* CATEGORY ICONS NAVIGATION */}
        {!isSearching && !isFreeShipping && tenant.categories.length > 0 && (
          <section className="mx-auto max-w-7xl px-2 mt-4 sm:px-4">
            <div className="bg-white rounded-md p-4 shadow-sm">
              <div className="flex space-x-6 overflow-x-auto scrollbar-hide pb-2 snap-x">
                <Link
                  href={`/${tenant.slug}`}
                  className="flex flex-col items-center gap-2 min-w-[70px] snap-start group"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:-translate-y-1 ${!selectedCategoryId ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] sm:text-xs text-center leading-tight ${!selectedCategoryId ? 'font-bold text-slate-900' : 'text-slate-600'}`}>Todos</span>
                </Link>

                {tenant.categories.map((cat, index) => {
                  const Icon = categoryIcons[index % categoryIcons.length];
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <Link
                      key={cat.id}
                      href={`/${tenant.slug}?categoria=${cat.id}`}
                      className="flex flex-col items-center gap-2 min-w-[70px] snap-start group"
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:-translate-y-1 ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-[10px] sm:text-xs text-center leading-tight line-clamp-2 ${isSelected ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                        {cat.name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        <div id="colecao" className="scroll-mt-4"></div>



        {/* FEATURED SECTION */}
        {!selectedCategoryId && !isSearching && !isFreeShipping && featured.length > 0 && (
          <section className="mx-auto max-w-7xl px-2 mt-4 sm:px-4">
            <div className="bg-white rounded-md shadow-sm p-4">
              <h2 className="text-lg font-extrabold text-slate-900 uppercase border-b-2 border-[#ee4d2d] inline-block pb-1 mb-4">
                Em Destaque
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {featured.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={serializeProduct(product)}
                    storeSlug={tenant.slug}
                    primaryColor={tenant.primaryColor}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ALL / FILTERED PRODUCTS SECTION */}
        <section className="mx-auto max-w-7xl px-2 mt-4 sm:px-4">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-slate-900 uppercase border-b-2 border-[#ee4d2d] inline-block pb-1">
              {isFreeShipping
                ? "Frete Grátis"
                : isSearching
                ? `Busca por "${searchQuery}"`
                : selectedCategoryId 
                ? tenant.categories.find(c => c.id === selectedCategoryId)?.name 
                : "Descobertas do Dia"}
            </h2>
          </div>

          {displayProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white p-12 text-center rounded-md shadow-sm">
              {isSearching ? <SearchX className="h-12 w-12 text-slate-300 mb-2" /> : <ShoppingBag className="h-12 w-12 text-slate-300 mb-2" />}
              <h3 className="text-sm font-bold text-slate-700">Nenhum produto encontrado</h3>
              {(selectedCategoryId || isSearching || isFreeShipping) && (
                <Link href={`/${tenant.slug}`} className="mt-4">
                  <button className="rounded-sm bg-[#ee4d2d] px-6 py-2 text-sm font-bold text-white transition hover:opacity-90">
                    Limpar filtros
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={serializeProduct(product)}
                  storeSlug={tenant.slug}
                  primaryColor={tenant.primaryColor}
                />
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-8 border-t border-slate-200 bg-white py-6">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
            <p className="text-sm font-bold text-slate-700">{tenant.name}</p>
            <p className="mt-1 text-xs text-slate-500">
              © {new Date().getFullYear()} Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
