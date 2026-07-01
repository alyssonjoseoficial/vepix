"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { checkEmailForRecovery, verifySecurityAnswer, resetPassword } from "@/lib/actions/auth";
import Link from "next/link";

export function ForgotPasswordClient() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await checkEmailForRecovery(email);
    if (res.error) {
      setError(res.error);
    } else if (res.success && res.question) {
      setQuestion(res.question);
      setStep(2);
    }
    setLoading(false);
  }

  async function handleAnswerSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await verifySecurityAnswer(email, answer);
    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setStep(3);
    }
    setLoading(false);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await resetPassword(email, newPassword);
    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setSuccessMessage("Senha alterada com sucesso!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Recuperação de Acesso</h1>
        <p className="text-sm text-slate-500 mt-2">
          {step === 1 && "Digite seu e-mail para buscar sua pergunta de segurança."}
          {step === 2 && "Responda à sua pergunta de segurança para continuar."}
          {step === 3 && "Crie uma nova senha para acessar sua conta."}
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm border border-emerald-100 font-medium">
          {successMessage}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail da sua conta</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="seu@email.com"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Buscando..." : "Continuar"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleAnswerSubmit} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sua Pergunta:</span>
            <p className="text-slate-900 font-medium mt-1">{question}</p>
          </div>
          <div>
            <Label htmlFor="answer">Sua Resposta Secreta</Label>
            <Input 
              id="answer" 
              type="text" 
              required 
              value={answer} 
              onChange={e => setAnswer(e.target.value)} 
              placeholder="Digite sua resposta"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep(1)}>
              Voltar
            </Button>
            <Button type="submit" className="w-2/3" disabled={loading}>
              {loading ? "Verificando..." : "Validar Resposta"}
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input 
              id="newPassword" 
              type="password" 
              required 
              minLength={6}
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Nova Senha"}
          </Button>
        </form>
      )}

      {step === 1 && (
        <div className="mt-6 text-center text-sm text-slate-500">
          Lembrou a senha?{" "}
          <Link href="/login" className="font-semibold text-[#ee4d2d] hover:underline">
            Voltar para o Login
          </Link>
        </div>
      )}
    </div>
  );
}
