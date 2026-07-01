"use client";

import Link from "next/link";
import { useState } from "react";
import { loginUser } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await loginUser(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-center mb-8 mt-6">
          <img src="/vepix_logo.png" alt="VePix" className="h-[80px] w-auto object-contain" />
        </div>
        <CardTitle className="text-center">Acessar sua Loja</CardTitle>
        <form action={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Senha</Label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Não tem conta?{" "}
          <Link href="/register" className="font-semibold text-blue-600">
            Criar loja grátis
          </Link>
        </p>
      </Card>
    </div>
  );
}
