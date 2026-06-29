"use client";

import { useState } from "react";
import { createSuperAdminUser } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function NewSuperAdminPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const result = await createSuperAdminUser(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/admin/users");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Adicionar Novo Usuário</h1>
        <p className="mt-2 text-sm text-slate-500">
          Crie um acesso para um novo membro da equipe na administração da plataforma.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" name="name" required placeholder="Ex: João da Silva" />
            </div>

            <div>
              <Label htmlFor="email">E-mail Corporativo</Label>
              <Input id="email" name="email" type="email" required placeholder="joao@storeflow.com" />
            </div>

            <div>
              <Label htmlFor="password">Senha Temporária</Label>
              <Input id="password" name="password" type="text" required placeholder="A senha que o usuário usará para o primeiro login" />
            </div>

            <div>
              <Label htmlFor="role">Nível de Acesso</Label>
              <select 
                id="role" 
                name="role" 
                required
                className="mt-2 block w-full rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                <option value="PLATFORM_OPERATOR">Operador (PLATFORM_OPERATOR)</option>
                <option value="PLATFORM_ADMIN">Administrador Geral (PLATFORM_ADMIN)</option>
              </select>
              <p className="mt-2 text-xs text-slate-500">
                <strong>Operador:</strong> Ideal para equipe de suporte e análise de contas.<br/>
                <strong>Administrador:</strong> Acesso total, incluindo criação de outros administradores e planos financeiros.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Criando usuário..." : "Adicionar Usuário"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
