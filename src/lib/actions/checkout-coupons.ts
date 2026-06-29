"use server";

import { prisma } from "@/lib/prisma";

export async function validateCoupon(tenantSlug: string, code: string, cartTotal: number) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) return { error: "Loja não encontrada." };

    const coupon = await prisma.coupon.findUnique({
      where: {
        tenantId_code: {
          tenantId: tenant.id,
          code: code.toUpperCase(),
        },
      },
    });

    if (!coupon) return { error: "Cupom não encontrado." };
    if (!coupon.active) return { error: "Este cupom não está mais ativo." };
    
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { error: "Este cupom já expirou." };
    }

    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return { error: "Este cupom atingiu o limite de usos." };
    }

    if (coupon.minOrderValue && cartTotal < Number(coupon.minOrderValue)) {
      return { error: `O valor mínimo para este cupom é R$ ${Number(coupon.minOrderValue).toFixed(2).replace(".", ",")}.` };
    }

    return {
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
      }
    };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao validar cupom." };
  }
}
