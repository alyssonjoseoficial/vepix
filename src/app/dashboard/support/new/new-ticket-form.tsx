"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createTicket } from "@/lib/actions/support";

export function NewTicketForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("tenantId", tenantId);

    const result = await createTicket(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.success) {
      router.push(`/dashboard/support/${result.ticketId}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="subject">Assunto do Chamado</Label>
        <Input 
          id="subject" 
          name="subject" 
          required 
          placeholder="Ex: Dúvida sobre integração do Mercado Pago" 
        />
      </div>

      <div>
        <Label htmlFor="priority">Prioridade</Label>
        <select
          id="priority"
          name="priority"
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          defaultValue="NORMAL"
        >
          <option value="LOW">Baixa (Dúvidas gerais)</option>
          <option value="NORMAL">Normal (Problemas não críticos)</option>
          <option value="HIGH">Alta (Sistema inoperante, vendas paradas)</option>
        </select>
      </div>

      <div>
        <Label htmlFor="description">Descrição do Problema</Label>
        <Textarea 
          id="description" 
          name="description" 
          required 
          rows={6}
          placeholder="Descreva detalhadamente o que está acontecendo..." 
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Enviando..." : "Enviar Chamado"}
        </Button>
      </div>
    </form>
  );
}
