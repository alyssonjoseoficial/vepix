import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function SimulatePaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string; planId?: string }>;
}) {
  const { tenantId, planId } = await searchParams;

  if (!tenantId || !planId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Simulação de Pagamento</h1>
        <p className="text-slate-500 mb-8 text-sm">
          Você está no ambiente de testes. O redirecionamento real para o Mercado Pago está desativado.
          Clique no botão abaixo para simular que o pagamento via PIX/Cartão foi **Aprovado**.
        </p>

        <form action="/api/webhooks/mercadopago" method="POST">
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="planId" value={planId} />
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
            Simular Pagamento Aprovado
          </Button>
        </form>
        
        <a href="/dashboard" className="block mt-6 text-sm text-slate-500 hover:underline">
          Cancelar e voltar
        </a>
      </div>
    </div>
  );
}
