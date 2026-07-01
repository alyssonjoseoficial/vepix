"use server";

import { prisma } from "@/lib/prisma";
import { getRecommendedProducts } from "@/lib/ai";

export async function getCartRecommendationsAction(storeSlug: string, cartItemIds: string[]) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: storeSlug },
    });

    if (!tenant) return [];

    const cartProducts = await prisma.product.findMany({
      where: { id: { in: cartItemIds }, tenantId: tenant.id },
      select: { categoryId: true }
    });

    const categoryIds = Array.from(new Set(cartProducts.map(p => p.categoryId).filter(Boolean))) as string[];

    const recommendedProducts = await prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        active: true,
        id: { notIn: cartItemIds },
        categoryId: categoryIds.length > 0 ? { in: categoryIds } : undefined
      },
      take: 8,
      orderBy: { createdAt: "desc" }
    });

    return recommendedProducts.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      imageUrl: (Array.isArray(p.imageUrls) && p.imageUrls.length > 0) ? String(p.imageUrls[0]) : null,
      featured: p.featured,
      stock: p.stock,
    }));
  } catch (e) {
    console.error("Erro em getCartRecommendationsAction:", e);
    return [];
  }
}
