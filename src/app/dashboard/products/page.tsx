import { prisma } from "@/lib/prisma";
import { requireTenantAccess } from "@/lib/tenant";
import { deleteProduct } from "@/lib/actions/store";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ProductForm } from "./product-form";
import { ProductFilter } from "@/components/dashboard/product-filter";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; q?: string; category?: string }>;
}) {
  const { tenant } = await requireTenantAccess();
  const { edit, q, category } = await searchParams;

  const whereClause: any = { tenantId: tenant.id };
  
  if (q) {
    whereClause.name = { contains: q };
  }
  
  if (category === "none") {
    whereClause.categoryId = null;
  } else if (category && category !== "all") {
    whereClause.categoryId = category;
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.category.findMany({ where: { tenantId: tenant.id }, orderBy: { name: "asc" } }),
  ]);

  let editingProduct = null;
  if (edit) {
    const p = products.find((p) => p.id === edit);
    if (p) {
      editingProduct = {
        ...p,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      };
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
      <Card>
        <CardTitle>{editingProduct ? "Editar produto" : "Novo produto"}</CardTitle>
        <ProductForm key={editingProduct?.id || `new-${products[0]?.id || 'empty'}`} categories={categories} editingProduct={editingProduct} />
      </Card>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <CardTitle>Produtos ({products.length})</CardTitle>
        </div>
        
        <ProductFilter categories={categories} />

        <div className="mt-6 space-y-4">
          {products.length === 0 ? (
            <p className="text-slate-400">Nenhum produto cadastrado.</p>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
              >
                <div className="flex items-center gap-4">
                  {Array.isArray(product.imageUrls) && product.imageUrls.length > 0 ? (
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-slate-100">
                      <Image src={String(product.imageUrls[0])} alt={product.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                      <span className="text-xs">Sem img</span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">
                      {formatCurrency(Number(product.price))} · Estoque: {product.stock}
                      {product.category ? ` · ${product.category.name}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/products?edit=${product.id}`}>
                    <Button type="button" variant="secondary" size="sm">
                      Editar
                    </Button>
                  </Link>
                  <form action={deleteProduct.bind(null, product.id)}>
                    <Button type="submit" variant="destructive" size="sm">
                      Excluir
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
