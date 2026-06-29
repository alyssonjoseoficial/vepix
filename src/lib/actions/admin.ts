"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/admin";
import { slugify } from "@/lib/utils";
import bcrypt from "bcryptjs";

export async function toggleTenantStatus(tenantId: string) {
  await requirePlatformAdmin();
  
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return { error: "Loja não encontrada." };

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { active: !tenant.active },
  });

  revalidatePath("/admin/tenants");
  revalidatePath(`/admin/tenants/${tenantId}`);
}

export async function upsertPlan(formData: FormData) {
  await requirePlatformAdmin();
  
  const id = formData.get("id") as string | null;
  const name = String(formData.get("name") ?? "").trim();
  const priceMonthlyStr = String(formData.get("priceMonthly") ?? "0");
  const maxProducts = parseInt(String(formData.get("maxProducts") ?? "100"), 10);
  const description = String(formData.get("description") ?? "").trim();
  const active = formData.get("active") === "on";

  if (!name) return { error: "Nome é obrigatório." };

  const priceMonthly = Math.round(parseFloat(priceMonthlyStr) * 100); // Convertendo para centavos

  if (id) {
    await prisma.plan.update({
      where: { id },
      data: { name, priceMonthly, maxProducts, description, active },
    });
  } else {
    const slug = slugify(name);
    await prisma.plan.create({
      data: { name, slug, priceMonthly, maxProducts, description, active },
    });
  }

  revalidatePath("/admin/plans");
}

export async function createSuperAdminUser(formData: FormData) {
  const session = await requirePlatformAdmin();
  
  if (session.user.role !== "PLATFORM_ADMIN") {
    return { error: "Apenas Administradores Gerais podem adicionar novos membros à equipe." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "PLATFORM_OPERATOR");

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter no mínimo 6 caracteres." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Este e-mail já está sendo utilizado por outro usuário." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role as "PLATFORM_ADMIN" | "PLATFORM_OPERATOR",
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function createTenantManually(formData: FormData) {
  const session = await requirePlatformAdmin();
  
  if (session.user.role !== "PLATFORM_ADMIN" && session.user.role !== "PLATFORM_OPERATOR") {
    return { error: "Acesso negado." };
  }

  const storeName = String(formData.get("storeName") ?? "").trim();
  const document = String(formData.get("document") ?? "").trim();
  const ownerName = String(formData.get("ownerName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!storeName || !document || !ownerName || !email || !password) {
    return { error: "Preencha todos os campos." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter no mínimo 6 caracteres." };
  }

  const storeSlug = slugify(storeName);

  const reservedWords = ["login", "register", "admin", "admin-login", "dashboard", "api", "loja", "pricing", "_next", "static", "public"];
  if (reservedWords.includes(storeSlug)) {
    return { error: "Este endereço da loja é reservado pelo sistema. Escolha outro." };
  }

  const existingSlug = await prisma.tenant.findUnique({ where: { slug: storeSlug } });
  if (existingSlug) {
    return { error: "O nome dessa loja já está em uso na plataforma. Escolha outro ou adicione um diferencial." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Este e-mail já está sendo utilizado por outro usuário." };
  }

  let starterPlan = await prisma.plan.findUnique({ where: { slug: "starter" } });
  if (!starterPlan) {
    // Busca o plano mais básico disponível se o starter não existir
    starterPlan = await prisma.plan.findFirst({
      orderBy: { priceMonthly: 'asc' }
    });
    if (!starterPlan) {
      return { error: "Nenhum plano disponível no sistema. Crie um plano antes de cadastrar uma loja." };
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: ownerName, email, passwordHash, role: "STORE_OWNER" },
    });

    const tenant = await tx.tenant.create({
      data: {
        name: storeName,
        slug: storeSlug,
        description: `Bem-vindo à ${storeName}`,
        settings: { 
          create: {
            document: document
          } 
        },
      },
    });

    await tx.tenantMember.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        role: "STORE_OWNER",
      },
    });

    await tx.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: starterPlan!.id,
        status: "TRIALING",
        trialEndsAt,
      },
    });
  });

  revalidatePath("/admin/tenants");
  return { success: true };
}
