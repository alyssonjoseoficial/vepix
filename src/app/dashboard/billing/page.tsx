import { getCurrentTenant } from "@/lib/tenant";
import { BillingBlock } from "@/components/dashboard/billing-block";
import { redirect } from "next/navigation";
import { getTenantBillingInfo } from "@/lib/billing";

export default async function BillingPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const billing = await getTenantBillingInfo(tenant.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Assinatura e Planos</h1>
      <p className="text-slate-500 mb-8">
        Gerencie sua assinatura, visualize o próximo vencimento e renove seu plano para continuar aproveitando a plataforma.
      </p>

      {billing.status !== "BLOCKED" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Detalhes da Assinatura Atual</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-slate-500">Status atual:</span>
              <strong className="text-slate-900">{billing.status === "ACTIVE" ? "Ativo (Pago)" : billing.status === "WARNING" ? "Vencendo em breve" : billing.status === "PAST_DUE" ? "Atrasado (Carência)" : "Trial"}</strong>
            </div>
            <div>
              <span className="block text-slate-500">Próximo Vencimento:</span>
              <strong className="text-slate-900">
                {billing.status === "TRIAL" ? billing.trialEndsAt.toLocaleDateString("pt-BR") : billing.currentPeriodEnd ? billing.currentPeriodEnd.toLocaleDateString("pt-BR") : "-"}
              </strong>
            </div>
            <div>
              <span className="block text-slate-500">Tempo Restante:</span>
              <strong className="text-slate-900">{billing.daysRemaining} {billing.daysRemaining === 1 ? 'dia' : 'dias'}</strong>
            </div>
          </div>
        </div>
      )}

      <BillingBlock tenantId={tenant.id} />
    </div>
  );
}
