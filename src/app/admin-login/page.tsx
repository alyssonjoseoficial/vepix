"use client";

import { useState } from "react";
import { loginUser } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("redirectTo", "/admin");

    try {
      const result = await loginUser(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (error) {
      // O Next.js redireciona disparando um erro.
      // Se cair aqui e não for AuthError, provavelmente é o redirect rodando com sucesso.
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-950 text-slate-100 shadow-2xl p-8">
        <div className="space-y-2 text-center pb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10">
            <ShieldAlert className="h-8 w-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Acesso Restrito</h2>
          <p className="text-sm text-slate-400">
            Painel exclusivo para a administração da plataforma.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">E-mail Corporativo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="superadmin@storeflow.com"
              className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-slate-900 border-slate-700 text-slate-100 focus-visible:ring-blue-600"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-500 mt-2">{error}</p>
          )}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6" disabled={loading}>
            {loading ? "Verificando Credenciais..." : "Autenticar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
