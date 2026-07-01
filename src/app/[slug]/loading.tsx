import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5]">
      <div className="flex flex-col items-center gap-4 text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin text-[#ee4d2d]" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Carregando...</p>
      </div>
    </div>
  );
}
