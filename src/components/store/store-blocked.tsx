import { Store } from "lucide-react";

export function StoreBlocked({ storeName, reason }: { storeName: string, reason: "SUSPENDED" | "BILLING" }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Store className="h-8 w-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Loja Indisponível</h1>
        <p className="text-slate-500 mb-6">
          A loja <strong>{storeName}</strong> encontra-se temporariamente indisponível no momento.
        </p>
        
        {reason === "BILLING" && (
          <p className="text-sm text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-100">
            Se você é o proprietário desta loja, por favor, acesse seu painel administrativo para regularizar sua assinatura.
          </p>
        )}
      </div>
    </div>
  );
}
