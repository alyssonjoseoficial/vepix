"use client";

import Link from "next/link";
import { useState } from "react";
import { registerStore } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function RegisterForm({ plans, defaultPlanId }: { plans: any[], defaultPlanId?: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await registerStore(formData);
    if (result?.error) setError(result.error);
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="planId">Escolha seu plano</Label>
        <select
          id="planId"
          name="planId"
          defaultValue={defaultPlanId || ""}
          className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} - Até {plan.maxProducts} produtos
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="name">Seu nome</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" minLength={6} required />
      </div>
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4 space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">Recuperação de Senha</h4>
        <p className="text-xs text-slate-500">Escolha uma pergunta para recuperar sua conta caso esqueça a senha.</p>
        <div>
          <Label htmlFor="securityQuestion" className="text-xs">Pergunta de Segurança</Label>
          <select
            id="securityQuestion"
            name="securityQuestion"
            className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            required
          >
            <option value="">Selecione uma pergunta...</option>
            <option value="Qual o nome do seu primeiro animal de estimação?">Qual o nome do seu primeiro animal de estimação?</option>
            <option value="Qual o nome da sua mãe?">Qual o nome da sua mãe?</option>
            <option value="Qual a cidade onde você nasceu?">Qual a cidade onde você nasceu?</option>
            <option value="Qual a sua comida favorita?">Qual a sua comida favorita?</option>
          </select>
        </div>
        <div>
          <Label htmlFor="securityAnswer" className="text-xs">Sua Resposta Secreta</Label>
          <Input id="securityAnswer" name="securityAnswer" placeholder="Digite a resposta" required />
        </div>
      </div>
      <hr className="border-slate-200" />
      <div>
        <Label htmlFor="storeName">Nome da loja</Label>
        <Input id="storeName" name="storeName" placeholder="Ex: Minha Loja" required />
      </div>
      <div>
        <Label htmlFor="storeSlug">Endereço da loja</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">/</span>
          <Input id="storeSlug" name="storeSlug" placeholder="minha-loja" required />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Criando sua loja..." : "Criar loja grátis"}
      </Button>
    </form>
  );
}
