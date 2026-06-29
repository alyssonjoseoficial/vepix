import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Clock, CheckCircle2 } from "lucide-react";

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-orange-100 text-orange-700 border-orange-200",
  RESOLVED: "bg-green-100 text-green-700 border-green-200",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusLabels: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em Atendimento",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
};

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  NORMAL: "Normal",
  HIGH: "Alta",
};

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Buscar a loja do usuário
  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!membership) return <div>Loja não encontrada.</div>;

  const tickets = await prisma.supportTicket.findMany({
    where: { tenantId: membership.tenantId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suporte Técnico</h1>
          <p className="text-sm text-slate-500">
            Fale diretamente com a equipe do VePix
          </p>
        </div>
        <Link href="/dashboard/support/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Chamado
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <MessageSquare className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Nenhum chamado aberto</h3>
            <p className="text-slate-500 max-w-sm mt-1">
              Precisa de ajuda com a plataforma? Abra um chamado e nossa equipe responderá em breve.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <Link 
                key={ticket.id} 
                href={`/dashboard/support/${ticket.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition block"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[ticket.status]}`}>
                      {statusLabels[ticket.status]}
                    </span>
                    <span className="text-xs font-medium text-slate-500 border border-slate-200 px-2 rounded-md">
                      Prioridade: {priorityLabels[ticket.priority]}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {ticket.subject}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Atualizado em {new Date(ticket.updatedAt).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {ticket._count.messages} mensagens
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <Button variant="outline" size="sm">Ver Chamado</Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
