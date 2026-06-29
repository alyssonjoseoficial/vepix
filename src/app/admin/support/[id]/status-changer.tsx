"use client";

import { useState } from "react";
import { updateTicketStatus } from "@/lib/actions/support";

export function StatusChanger({ ticketId, currentStatus }: { ticketId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    const newStatus = e.target.value;
    const res = await updateTicketStatus(ticketId, newStatus);
    if (res.error) {
      alert(res.error);
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alterar Status:</label>
      <select 
        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
        value={currentStatus}
        onChange={handleChange}
        disabled={loading}
      >
        <option value="OPEN">Aberto</option>
        <option value="IN_PROGRESS">Em Atendimento</option>
        <option value="RESOLVED">Resolvido</option>
        <option value="CLOSED">Fechado (Finalizado)</option>
      </select>
    </div>
  );
}
