import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Store,
  Smartphone,
  CreditCard,
  Zap,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

const features = [
  {
    icon: Store,
    title: "Loja white-label",
    description: "Cada negócio com identidade própria, domínio e cores personalizadas.",
  },
  {
    icon: Smartphone,
    title: "100% responsivo",
    description: "Experiência fluida no celular, tablet e desktop.",
  },
  {
    icon: Sparkles,
    title: "IA integrada",
    description: "Descrições de produtos geradas automaticamente com Gemini.",
  },
  {
    icon: CreditCard,
    title: "SaaS mensal",
    description: "Planos simples por loja. Trial de 14 dias para começar.",
  },
  {
    icon: Zap,
    title: "Deploy rápido",
    description: "Neon + Render. Infraestrutura moderna e escalável.",
  },
];
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { priceMonthly: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <img src="/vepix_logo_LP.png" alt="VePix Logo" className="h-[60px] md:h-[80px] w-auto object-contain" />
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-slate-300 hover:text-white">
            Entrar
          </Link>
          <Link href="/register">
            <Button>Criar loja grátis</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              E-commerce SaaS Multi-tenant
            </p>
            <h1 className="mt-6 text-5xl font-bold leading-tight sm:text-6xl">
              Sua loja online elite, pronta em minutos
            </h1>
            <p className="mt-6 max-w-lg text-lg text-slate-400">
              Plataforma moderna para qualquer negócio vender online. Painel intuitivo,
              loja responsiva, IA e cobrança mensal por loja.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Começar trial de 14 dias
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-slate-700 bg-transparent text-white hover:bg-slate-900">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square overflow-hidden [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
              {/* Glow effect behind */}
              <div className="absolute inset-0 bg-blue-600/30 blur-[100px] rounded-full scale-75 animate-pulse"></div>
              <Image 
                src="/hero_ecommerce_dash.png" 
                alt="Plataforma Elite VePix" 
                fill 
                className="object-cover animate-[float_6s_ease-in-out_infinite]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur"
          >
            <feature.icon className="h-8 w-8 text-blue-400" />
            <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-slate-800 bg-slate-900/30 py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold">
            {plans.length > 0
              ? `Planos a partir de ${formatCurrency(plans[0].priceMonthly / 100)}/mês`
              : "Nossos Planos"}
          </h2>
          <p className="mt-3 text-slate-400">14 dias grátis. Sem cartão para começar.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-slate-700 p-6 flex flex-col h-full">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-3xl font-bold text-blue-400">
                  {formatCurrency(plan.priceMonthly / 100)}<span className="text-sm text-slate-500 font-normal">/mês</span>
                </p>
                <div className="mt-4 flex-1">
                  <p className="text-sm font-medium text-slate-300">
                    Até {plan.maxProducts} produtos
                  </p>
                  {plan.description && (
                    <p className="mt-2 text-xs text-slate-400 border-t border-slate-800 pt-2">
                      {plan.description}
                    </p>
                  )}
                </div>
                <div className="mt-6">
                  <Link href={`/register?plan=${plan.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Assinar grátis
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {plans.length === 0 && (
              <p className="col-span-3 text-slate-500">Planos sendo configurados em breve...</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
