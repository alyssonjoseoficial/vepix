import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewTicketForm } from "./new-ticket-form";

export default async function NewTicketPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!membership) return <div>Loja não encontrada.</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/dashboard/support" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-4 transition">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Chamados
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Abrir Novo Chamado</h1>
        <p className="text-sm text-slate-500">
          Descreva detalhadamente o seu problema ou dúvida para que possamos ajudar da melhor forma.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <NewTicketForm tenantId={membership.tenantId} />
      </div>
    </div>
  );
}
