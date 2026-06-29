"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user) return { notifications: [] };

  let tenantId = session.user.tenantId;
  const role = session.user.role;

  // Se for admin, busca notificações com tenantId = null (são notificações globais para o admin)
  if (role === "PLATFORM_ADMIN" || role === "PLATFORM_OPERATOR") {
    tenantId = null;
  } else if (!tenantId) {
    return { notifications: [] };
  }

  const notifications = await prisma.platformNotification.findMany({
    where: {
      tenantId: tenantId,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return { notifications };
}

export async function markNotificationAsRead(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  let tenantId = session.user.tenantId;
  const role = session.user.role;

  if (role === "PLATFORM_ADMIN" || role === "PLATFORM_OPERATOR") {
    tenantId = null;
  }

  const notification = await prisma.platformNotification.findUnique({ where: { id } });
  
  if (!notification || notification.tenantId !== tenantId) {
    return { error: "Não autorizado" };
  }

  await prisma.platformNotification.update({
    where: { id },
    data: { read: true },
  });

  revalidatePath("/"); // revalida geral pra garantir atualização visual
  return { success: true };
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  let tenantId = session.user.tenantId;
  const role = session.user.role;

  if (role === "PLATFORM_ADMIN" || role === "PLATFORM_OPERATOR") {
    tenantId = null;
  }

  await prisma.platformNotification.updateMany({
    where: { tenantId, read: false },
    data: { read: true },
  });

  revalidatePath("/");
  return { success: true };
}
