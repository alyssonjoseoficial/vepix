import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TicketChat } from "@/components/support/ticket-chat";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      tenant: { include: { members: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { name: true } } },
      },
    },
  });

  if (!ticket) notFound();

  // Valida permissão
  const isMember = ticket.tenant.members.some((m) => m.userId === session.user.id);
  if (!isMember) notFound();

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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/support" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-2 transition">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Chamados
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{ticket.subject}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[ticket.status]}`}>
              {statusLabels[ticket.status]}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Ticket #{ticket.id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      <TicketChat 
        ticketId={ticket.id} 
        initialMessages={ticket.messages} 
        status={ticket.status} 
        isAdminView={false} 
      />
    </div>
  );
}
