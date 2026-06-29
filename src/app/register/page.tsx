import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { RegisterForm } from "./register-form";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  
  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { priceMonthly: "asc" }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-lg">
        <div className="flex justify-center mb-8 mt-6">
          <img src="/vepix_logo.png" alt="VePix" className="h-[80px] w-auto object-contain" />
        </div>
        <CardTitle className="text-center">Criar sua loja na VePix</CardTitle>
        <p className="mt-2 text-center text-sm text-slate-500">14 dias grátis. Comece a vender hoje.</p>
        
        <RegisterForm plans={plans} defaultPlanId={plan} />

        <p className="mt-6 text-center text-sm text-slate-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-blue-600">
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  );
}
