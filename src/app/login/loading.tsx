import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4 text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Carregando...</p>
      </div>
    </div>
  );
}
