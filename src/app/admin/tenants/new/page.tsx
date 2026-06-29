"use client";

import { useState } from "react";
import { createTenantManually } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function NewTenantPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createTenantManually(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/admin/tenants");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Cadastro Manual de Loja</h1>
        <p className="mt-2 text-sm text-slate-500">
          Crie uma conta e um ambiente de loja para um cliente diretamente pelo painel.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <CardTitle className="text-lg mb-4">Dados da Loja</CardTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="storeName">Nome da Loja</Label>
                  <Input id="storeName" name="storeName" required placeholder="Ex: Crochê da Vovó" />
                </div>
                <div>
                  <Label htmlFor="document">CNPJ ou CPF</Label>
                  <Input id="document" name="document" required placeholder="Apenas números ou formatado" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <CardTitle className="text-lg mb-4">Dados do Dono (Acesso)</CardTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="ownerName">Nome Completo do Responsável</Label>
                  <Input id="ownerName" name="ownerName" required placeholder="Ex: Maria da Silva" />
                </div>
                <div>
                  <Label htmlFor="email">E-mail (Login)</Label>
                  <Input id="email" name="email" type="email" required placeholder="maria@email.com" />
                </div>
                <div>
                  <Label htmlFor="password">Senha Temporária</Label>
                  <Input id="password" name="password" type="text" required placeholder="Senha inicial para o lojista" />
                </div>
              </div>
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
              {loading ? "Criando loja..." : "Cadastrar Loja"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
