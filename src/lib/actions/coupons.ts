"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireTenantAccess } from "@/lib/tenant";

export async function getCoupons() {
  try {
    const { tenant } = await requireTenantAccess();
    const tenantId = tenant.id;
    const coupons = await prisma.coupon.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
    return { coupons };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao buscar cupons" };
  }
}

export async function getCoupon(id: string) {
  try {
    const { tenant } = await requireTenantAccess();
    const tenantId = tenant.id;
    
    const coupon = await prisma.coupon.findUnique({
      where: { id, tenantId },
    });
    return { coupon };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao buscar cupom" };
  }
}

export async function createCoupon(data: any) {
  try {
    const { tenant } = await requireTenantAccess();
    const tenantId = tenant.id;
    
    const existing = await prisma.coupon.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: data.code.toUpperCase(),
        },
      },
    });

    if (existing) {
      return { error: "Já existe um cupom com este código." };
    }

    await prisma.coupon.create({
      data: {
        tenantId,
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        minOrderValue: data.minOrderValue ? Number(data.minOrderValue) : null,
        active: data.active,
        maxUses: data.maxUses ? Number(data.maxUses) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    revalidatePath("/dashboard/coupons");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Erro ao criar cupom." };
  }
}

export async function updateCoupon(id: string, data: any) {
  try {
    const { tenant } = await requireTenantAccess();
    const tenantId = tenant.id;

    const existing = await prisma.coupon.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: data.code.toUpperCase(),
        },
      },
    });

    if (existing && existing.id !== id) {
      return { error: "Já existe outro cupom com este código." };
    }

    await prisma.coupon.update({
      where: { id, tenantId },
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        minOrderValue: data.minOrderValue ? Number(data.minOrderValue) : null,
        active: data.active,
        maxUses: data.maxUses ? Number(data.maxUses) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    revalidatePath("/dashboard/coupons");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Erro ao atualizar cupom." };
  }
}

export async function deleteCoupon(id: string) {
  try {
    const { tenant } = await requireTenantAccess();
    const tenantId = tenant.id;
    
    await prisma.coupon.delete({
      where: { id, tenantId },
    });
    revalidatePath("/dashboard/coupons");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao excluir cupom." };
  }
}
