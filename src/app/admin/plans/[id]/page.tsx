import { requirePlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { PlanForm } from "@/components/admin/plan-form";
import { notFound } from "next/navigation";

export default async function AdminPlanEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await params;

  let plan = null;

  if (id !== "new") {
    plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan) notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{plan ? "Editar Plano" : "Novo Plano"}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Configure as características financeiras e operacionais deste pacote.
        </p>
      </div>

      <Card className="p-6">
        <PlanForm plan={plan} />
      </Card>
    </div>
  );
}
