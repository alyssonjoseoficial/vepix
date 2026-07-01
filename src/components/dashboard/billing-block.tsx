import { prisma } from "@/lib/prisma";
import { CheckoutButton } from "./checkout-button";
import { auth } from "@/lib/auth";

export async function BillingBlock({ tenantId, billingStatus, daysRemaining }: { tenantId: string, billingStatus?: string, daysRemaining?: number }) {
  const session = await auth();
  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { priceMonthly: "asc" }
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-4xl mx-auto">
      {billingStatus === "BLOCKED" && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-8 w-full shadow-sm">
          <h2 className="text-xl font-bold mb-2">Acesso Temporariamente Suspenso</h2>
          <p className="text-sm">
            Seu período de teste grátis ou assinatura atual expirou. Para continuar aproveitando sua loja e realizando vendas, por favor, renove sua assinatura escolhendo um dos planos abaixo.
          </p>
        </div>
      )}

      {billingStatus === "PAST_DUE" && (
        <div className="bg-orange-50 text-orange-700 p-4 rounded-xl border border-orange-200 mb-8 w-full shadow-sm">
          <h2 className="text-xl font-bold mb-2">Assinatura Vencida</h2>
          <p className="text-sm">
            Sua assinatura está vencida há {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}. O acesso à sua loja será suspenso após o 5º dia de atraso. Renove agora para evitar o bloqueio.
          </p>
        </div>
      )}

      {billingStatus === "WARNING" && (
        <div className="bg-amber-50 text-amber-700 p-4 rounded-xl border border-amber-200 mb-8 w-full shadow-sm">
          <h2 className="text-xl font-bold mb-2">Lembrete de Vencimento</h2>
          <p className="text-sm">
            Sua assinatura vencerá em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}. Garanta que o pagamento seja realizado para evitar a suspensão da sua loja.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
            <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
            <div className="mt-6 mb-8 text-3xl font-extrabold text-slate-900">
              R$ {(plan.priceMonthly / 100).toFixed(2).replace('.', ',')}
              <span className="text-sm font-normal text-slate-500">/mês</span>
            </div>
            
            <ul className="text-sm text-slate-600 mb-8 space-y-3 flex-1 text-left">
              <li className="flex gap-2 items-center">
                <span className="text-emerald-500">✓</span> Até {plan.maxProducts} produtos
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-emerald-500">✓</span> Domínio personalizado
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-emerald-500">✓</span> Suporte premium
              </li>
            </ul>

            <CheckoutButton planId={plan.id} price={plan.priceMonthly} email={session?.user?.email || "contato@vepix.com.br"} mpPublicKey={process.env.MP_PUBLIC_KEY || process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || ""} />
          </div>
        ))}
      </div>
    </div>
  );
}
