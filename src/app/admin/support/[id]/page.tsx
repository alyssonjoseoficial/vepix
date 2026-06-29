import { requirePlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Store } from "lucide-react";
import { TicketChat } from "@/components/support/ticket-chat";
import { StatusChanger } from "./status-changer";

export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePlatformAdmin();

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      tenant: true,
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { name: true } } },
      },
    },
  });

  if (!ticket) notFound();

  const statusLabels: Record<string, string> = {
    OPEN: "Aberto",
    IN_PROGRESS: "Em Atendimento",
    RESOLVED: "Resolvido",
    CLOSED: "Fechado",
  };

  const statusColors: Record<string, string> = {
    OPEN: "bg-blue-100 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-orange-100 text-orange-700 border-orange-200",
    RESOLVED: "bg-green-100 text-green-700 border-green-200",
    CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/support" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-2 transition">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Fila
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{ticket.subject}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[ticket.status]}`}>
              {statusLabels[ticket.status]}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Ticket #{ticket.id.slice(-6).toUpperCase()} • Aberto em {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</p>
        </div>
        <StatusChanger ticketId={ticket.id} currentStatus={ticket.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TicketChat 
            ticketId={ticket.id} 
            initialMessages={ticket.messages} 
            status={ticket.status} 
            isAdminView={true} 
          />
        </div>
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Store className="h-4 w-4" /> Dados da Loja
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-slate-500 text-xs">Nome da Loja</span>
                <span className="font-medium text-slate-900">{ticket.tenant.name}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs">Slug</span>
                <span className="font-medium text-slate-900">/{ticket.tenant.slug}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs">Plano Atual</span>
                <span className="font-medium text-slate-900">Em desenvolvimento</span>
              </div>
            </div>
            <Link href={`/admin/tenants/${ticket.tenantId}`} className="mt-4 block text-center w-full py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200">
              Acessar Perfil da Loja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
