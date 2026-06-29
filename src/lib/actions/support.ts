"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requirePlatformAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

// ==========================================
// AÇÕES DO LOJISTA (TENANT)
// ==========================================

export async function createTicket(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado." };
  
  const tenantId = formData.get("tenantId") as string;
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as any;

  if (!tenantId || !subject || !description) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  // Verifica se o usuário é dono da loja
  const membership = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId, userId: session.user.id } },
  });

  if (!membership) {
    return { error: "Sem permissão." };
  }

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        tenantId,
        subject,
        description,
        priority: priority || "NORMAL",
        status: "OPEN",
        messages: {
          create: {
            message: description,
            senderId: session.user.id,
            isFromAdmin: false,
          }
        }
      },
    });

    // Notificar a equipe Admin
    await prisma.platformNotification.create({
      data: {
        message: `Novo chamado aberto: ${subject}`,
        tenantId: null,
      }
    });

    revalidatePath("/dashboard/support");
    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error("Erro ao criar ticket:", error);
    return { error: "Erro interno ao criar o chamado." };
  }
}

export async function addTicketMessage(ticketId: string, message: string, isFromAdmin: boolean = false) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado." };

  if (!message.trim()) {
    return { error: "A mensagem não pode estar vazia." };
  }

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { tenant: { include: { members: true } } },
    });

    if (!ticket) return { error: "Chamado não encontrado." };

    // Validação de acesso
    if (!isFromAdmin) {
      const isMember = ticket.tenant.members.some(m => m.userId === session.user.id);
      if (!isMember) return { error: "Acesso negado." };
    }

    await prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: session.user.id,
        message,
        isFromAdmin,
      },
    });

    const newStatus = isFromAdmin ? "IN_PROGRESS" : "OPEN";
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: newStatus, updatedAt: new Date() },
    });

    // Enviar notificação
    if (isFromAdmin) {
      await prisma.platformNotification.create({
        data: {
          message: `Nova resposta do Suporte no chamado: ${ticket.subject}`,
          tenantId: ticket.tenantId,
        }
      });
    } else {
      await prisma.platformNotification.create({
        data: {
          message: `Nova mensagem da loja ${ticket.tenant.name} no chamado: ${ticket.subject}`,
          tenantId: null,
        }
      });
    }

    revalidatePath(`/dashboard/support/${ticketId}`);
    revalidatePath(`/admin/support/${ticketId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao adicionar mensagem:", error);
    return { error: "Erro interno." };
  }
}

// ==========================================
// AÇÕES DO ADMIN
// ==========================================

export async function updateTicketStatus(ticketId: string, status: any) {
  const session = await requirePlatformAdmin(); // Somente admin pode forçar status

  try {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });

    revalidatePath("/admin/support");
    revalidatePath(`/admin/support/${ticketId}`);
    revalidatePath(`/dashboard/support/${ticketId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar ticket:", error);
    return { error: "Erro interno." };
  }
}
