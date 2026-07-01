"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { PLANS } from "@/lib/stripe";
import { AuthError } from "next-auth";

export async function registerStore(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const storeName = String(formData.get("storeName") ?? "").trim();
  const storeSlug = slugify(String(formData.get("storeSlug") ?? storeName));
  const planId = String(formData.get('planId') ?? '').trim();
  const securityQuestion = String(formData.get('securityQuestion') ?? '').trim();
  const securityAnswer = String(formData.get('securityAnswer') ?? '').trim();

  if (!name || !email || !password || !storeName || !storeSlug) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Este e-mail já está cadastrado." };
  }

  const reservedWords = ["login", "register", "admin", "admin-login", "dashboard", "api", "loja", "pricing", "_next", "static", "public"];
  if (reservedWords.includes(storeSlug)) {
    return { error: "Este endereço da loja é reservado pelo sistema. Escolha outro." };
  }

  const existingSlug = await prisma.tenant.findUnique({ where: { slug: storeSlug } });
  if (existingSlug) {
    return { error: "Este endereço da loja já está em uso. Escolha outro." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Buscar o plano selecionado. Se não achar, pega o mais barato ativo.
  let selectedPlan;
  if (planId) {
    selectedPlan = await prisma.plan.findUnique({ where: { id: planId } });
  }
  
  if (!selectedPlan) {
    const plans = await prisma.plan.findMany({ where: { active: true }, orderBy: { priceMonthly: "asc" }, take: 1 });
    selectedPlan = plans[0];
  }

  // Se ainda não tiver plano (banco vazio), cria um fallback de emergência
  if (!selectedPlan) {
    const starter = PLANS[0];
    selectedPlan = await prisma.plan.create({
      data: {
        name: starter.name,
        slug: starter.slug,
        description: starter.description,
        priceMonthly: starter.priceMonthly,
        maxProducts: starter.maxProducts,
      },
    });
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash, role: 'STORE_OWNER', securityQuestion, securityAnswer },
    });

    const tenant = await tx.tenant.create({
      data: {
        name: storeName,
        slug: storeSlug,
        description: `Bem-vindo à ${storeName}`,
        settings: { create: {} },
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
        planId: selectedPlan!.id,
        status: "TRIALING",
        trialEndsAt,
      },
    });
  });

  await signIn("credentials", { email, password, redirect: false });
  redirect("/dashboard");
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard");

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "E-mail ou senha inválidos." };
        default:
          return { error: "Ocorreu um erro no login." };
      }
    }
    // IMPORTANTE: O Next.js usa erros (throw) para fazer redirecionamento.
    // Se não re-lançarmos o erro (throw error), o redirecionamento (redirectTo: "/dashboard")
    // falhará silenciosamente ou cairá no catch.
    throw error;
  }
}

export async function checkEmailForRecovery(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "E-mail n�o encontrado." };
  if (!user.securityQuestion) return { error: "Este usu�rio n�o configurou uma Pergunta de Seguran�a." };
  return { success: true, question: user.securityQuestion };
}

export async function verifySecurityAnswer(email: string, answer: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.securityAnswer) return { error: "Erro interno." };
  
  if (user.securityAnswer.trim().toLowerCase() !== answer.trim().toLowerCase()) {
    return { error: "Resposta incorreta." };
  }
  return { success: true };
}

export async function resetPassword(email: string, newPassword: string) {
  if (newPassword.length < 6) return { error: "A senha deve ter pelo menos 6 caracteres." };
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { email },
    data: { passwordHash }
  });
  return { success: true };
}

export async function updateSecurityQuestion(email: string, question: string, answer: string) {
  await prisma.user.update({
    where: { email },
    data: { securityQuestion: question, securityAnswer: answer }
  });
  return { success: true };
}
