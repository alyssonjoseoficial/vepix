"use server";

import { prisma } from "@/lib/prisma";
import { getRecommendedProducts } from "@/lib/ai";

export async function getCartRecommendationsAction(storeSlug: string, cartItemNames: string[]) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: storeSlug },
      include: {
        products: { where: { active: true } },
      },
    });

    if (!tenant || tenant.products.length === 0) return [];

    const userContext = cartItemNames.length > 0 
      ? "Produtos atualmente no carrinho do cliente: " + cartItemNames.join(", ") 
      : undefined;

    const recommendedIds = await getRecommendedProducts(
      tenant.products.map(p => ({ id: p.id, name: p.name, description: p.description })),
      userContext
    );

    const recommendedProducts = tenant.products
      .filter((p) => recommendedIds.includes(p.id))
      .map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        imageUrl: (Array.isArray(p.imageUrls) && p.imageUrls.length > 0) ? String(p.imageUrls[0]) : null,
        featured: p.featured,
        stock: p.stock,
      }));

    return recommendedProducts;
  } catch (e) {
    console.error("Erro em getCartRecommendationsAction:", e);
    return [];
  }
}
