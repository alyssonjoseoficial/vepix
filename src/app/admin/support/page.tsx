import { requirePlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Clock, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function AdminSupportPage() {
  await requirePlatformAdmin();

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      tenant: { select: { name: true, slug: true } },
      _count: { select: { messages: true } },
    },
  });

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

  const priorityLabels: Record<string, string> = {
    LOW: "Baixa",
    NORMAL: "Normal",
    HIGH: "Alta",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suporte a Lojistas</h1>
          <p className="text-sm text-slate-500">
            Gerencie os chamados de suporte de todas as lojas da plataforma.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="pl-9 bg-white" placeholder="Buscar por assunto ou loja..." />
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nenhum chamado registrado.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <Link 
                key={ticket.id} 
                href={`/admin/support/${ticket.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition block"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[ticket.status]}`}>
                      {statusLabels[ticket.status]}
                    </span>
                    <span className={`text-xs font-bold px-2 rounded-md border ${
                      ticket.priority === 'HIGH' ? 'text-red-700 border-red-200 bg-red-50' : 'text-slate-500 border-slate-200'
                    }`}>
                      {priorityLabels[ticket.priority]}
                    </span>
                    <span className="text-xs text-slate-400">
                      Loja: <strong className="text-slate-700">{ticket.tenant.name}</strong>
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {ticket.subject}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Última att: {new Date(ticket.updatedAt).toLocaleString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {ticket._count.messages} mensagens
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
