import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoreHeader } from "@/components/store/header";
import { formatCurrency } from "@/lib/utils";
import { ProductDetailClient } from "@/components/store/product-detail-client";
import { ProductGallery } from "@/components/store/product-gallery";
import { CartProvider } from "@/components/store/cart-context";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  });

  if (!tenant) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId, tenantId: tenant.id },
    include: { category: true },
  });

  if (!product || !product.active) notFound();

  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;

  return (
    <CartProvider storeSlug={tenant.slug}>
      <div className="min-h-screen bg-slate-50">
        <StoreHeader store={tenant} />
        
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Image Gallery */}
            <div className="lg:col-span-5 w-full">
              <ProductGallery images={product.imageUrls} productName={product.name} />
            </div>

            {/* Product Info */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {product.category && (
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {product.category.name}
                </p>
              )}
              <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold" style={{ color: tenant.primaryColor }}>
                  {formatCurrency(price)}
                </span>
                {comparePrice && comparePrice > price && (
                  <span className="text-xl text-slate-400 line-through">
                    {formatCurrency(comparePrice)}
                  </span>
                )}
              </div>

              <div className="prose prose-slate mb-8 max-w-none text-slate-600">
                <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
              </div>

              <div className="mt-auto">
                <ProductDetailClient 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: price,
                    imageUrl: (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : undefined,
                    stock: product.stock,
                    freeShipping: product.freeShipping
                  }} 
                  primaryColor={tenant.primaryColor}
                  storeSlug={tenant.slug}
                />
                <p className="mt-4 text-sm text-slate-500">
                  {product.stock > 0 ? `${product.stock} unidades em estoque` : "Produto Esgotado"}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </CartProvider>
  );
}
