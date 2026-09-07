import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Store,
  Smartphone,
  CreditCard,
  Zap,
  Check,
  X,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Bot,
  Truck,
  Percent,
  ChevronDown,
  MessageCircle,
  Layers,
  Shirt,
  Headphones,
  Tag,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { priceMonthly: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500 selection:text-white">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/vepix_logo_LP.png"
              alt="VePix Logo"
              className="h-[52px] md:h-[68px] w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#como-funciona" className="hover:text-white transition-colors">
              Como Funciona
            </a>
            <a href="#recursos" className="hover:text-white transition-colors">
              Recursos
            </a>
            <a href="#para-quem" className="hover:text-white transition-colors">
              Para Quem É
            </a>
            <a href="#planos" className="hover:text-white transition-colors">
              Planos
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              Dúvidas
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900 transition-all"
            >
              Entrar
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/30">
                Criar loja grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-12 md:pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              Sua Loja Pronta Hoje • 0% de Comissão por Venda
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl tracking-tight">
              Sua loja virtual no ar em{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                5 minutos
              </span>
              , sem pagar comissão.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-400 leading-relaxed">
              Crie seu catálogo profissional para vender pelo WhatsApp, Instagram e
              internet: produtos organizados com fotos, pagamento no Pix ou cartão,
              cálculo de frete e descrições feitas por Inteligência Artificial em 1 clique.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/40 text-base font-bold h-13 px-8">
                  Começar 14 dias grátis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white h-13 px-7 text-base font-semibold"
                >
                  Ver como funciona
                </Button>
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Teste grátis sem precisar de cartão de crédito. Cancele quando quiser.
            </p>
          </div>

          {/* HERO IMAGE COM GLOW */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative w-full aspect-[4/3] rounded-3xl border border-slate-800/80 bg-slate-900/40 p-3 shadow-2xl shadow-blue-950/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-blue-600/25 blur-[90px] rounded-full scale-75 animate-pulse -z-10"></div>
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src="/hero_ecommerce_dash.png"
                  alt="Plataforma de E-commerce VePix"
                  fill
                  className="object-cover animate-[float_6s_ease-in-out_infinite]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 SELOS DE VALOR IMEDIATO */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Link na Bio & WhatsApp</p>
              <p className="text-xs text-slate-400">Cliente escolhe e compra sozinho</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">0% de Comissão por Venda</p>
              <p className="text-xs text-slate-400">100% do lucro fica no seu bolso</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Descrições Feitas por IA</p>
              <p className="text-xs text-slate-400">Gere textos envolventes em 1 toque</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Pix & Cartão Automático</p>
              <p className="text-xs text-slate-400">Receba na hora com baixa no estoque</p>
            </div>
          </div>
        </div>
      </section>

      {/* ANTES VS DEPOIS (O CHOQUE DE REALIDADE) */}
      <section id="como-funciona" className="border-t border-slate-800/80 bg-slate-900/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">
              A Verdade Sobre Vender Online
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Por que lojistas com o <span className="text-blue-400">VePix</span> lucram muito mais?
            </h2>
            <p className="mt-4 text-slate-400 text-base sm:text-lg">
              Veja a diferença entre perder vendas no WhatsApp desorganizado ou ter uma vitrine profissional que vende no piloto automático.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* O JEITO ANTIGO */}
            <div className="rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-500/5 to-slate-900/50 p-8 sm:p-10">
              <div className="flex items-center gap-3 text-red-400 font-bold text-xl mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <X className="h-5 w-5" />
                </div>
                A Rotina Cansativa no WhatsApp
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Fotos avulsas no chat:</strong> Ter que enviar 20 fotos com preço no texto para cada pessoa que pergunta.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Cálculo manual e estresse:</strong> Somar itens na calculadora, calcular frete e passar a chave Pix enquanto atende outro cliente.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Venda de produto esgotado:</strong> Vender peça que já acabou no estoque e passar constrangimento pedindo desculpas.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Taxas abusivas de até 20%:</strong> Deixar grande parte do seu lucro nas mãos de marketplaces e intermediários.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Noites em claro cadastrando itens:</strong> Gastar horas pensando no que escrever para descrever cada produto.
                  </span>
                </li>
              </ul>
            </div>

            {/* COM O VEPIX */}
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-slate-900/50 p-8 sm:p-10 shadow-xl shadow-emerald-950/20">
              <div className="flex items-center gap-3 text-emerald-400 font-bold text-xl mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Check className="h-5 w-5" />
                </div>
                Com Sua Loja Virtual VePix
              </div>
              <ul className="space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Link profissional na bio e status:</strong> O cliente clica, vê o catálogo completo com fotos e preços organizados.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Carrinho e pedido automático:</strong> O cliente escolhe tamanho, cor, calcula frete e paga no Pix ou cartão sozinho.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Estoque 100% blindado:</strong> Cada venda dá baixa automática; o produto esgotado é pausado sozinho.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero comissão por venda:</strong> Mensalidade fixa e transparente. Todo o lucro das suas vendas é exclusivamente seu.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Inteligência Artificial que vende:</strong> A IA escreve títulos irresistíveis e descrições completas em 3 segundos.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* OS 6 GRANDES PILARES (RECURSOS DO SISTEMA) */}
      <section id="recursos" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">
              Tudo o que sua loja precisa
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Recursos poderosos, explicados de forma <span className="text-blue-400">simples</span>
            </h2>
            <p className="mt-4 text-slate-400 text-base sm:text-lg">
              Sem termos complicados. Desenvolvido para qualquer lojista gerenciar vendas no celular com máxima facilidade.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. SUA MARCA */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 hover:border-blue-500/40 transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-6">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sua Marca e Seu Link Próprio</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sua loja com sua logomarca, cores personalizadas e link exclusivo para divulgar nas redes sociais ou conectar seu próprio domínio (.com.br).
              </p>
            </div>

            {/* 2. IA INTEGRADA */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 hover:border-purple-500/40 transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Descrições com Inteligência Artificial</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sem inspiração para escrever? Basta digitar o nome do produto e a IA cria títulos persuasivos, benefícios e especificações que estimulam o cliente a comprar.
              </p>
            </div>

            {/* 3. VENDA PELO WHATSAPP OU CHECKOUT */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 hover:border-emerald-500/40 transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Venda no WhatsApp ou Checkout</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                O cliente pode pagar na hora pelo Pix/Cartão ou enviar o carrinho pronto no seu WhatsApp com todos os itens já somados para você só combinar a entrega.
              </p>
            </div>

            {/* 4. GRADE E ESTOQUE */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 hover:border-amber-500/40 transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-6">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Tamanhos, Cores & Controle de Estoque</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Cadastre variações como P, M, G ou cores diferentes. O estoque atualiza sozinho a cada pedido confirmado, garantindo que você nunca venda além da conta.
              </p>
            </div>

            {/* 5. CUPONS E BANNERS */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 hover:border-pink-500/40 transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400 mb-6">
                <Tag className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Cupons de Desconto & Banners</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Crie cupons de primeira compra, promoções relâmpago e banners de destaque (como "Frete Grátis acima de R$ 150") para incentivar clientes a comprarem mais.
              </p>
            </div>

            {/* 6. PAINEL SIMPLES */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 hover:border-teal-500/40 transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 mb-6">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Painel de Vendas no Celular</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Acompanhe o faturamento do dia, novos pedidos, clientes cadastrados e status de envio de qualquer lugar, direto pelo navegador do seu celular.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PARA QUEM É (SEGMENTAÇÃO PRÁTICA) */}
      <section id="para-quem" className="border-t border-slate-800/80 bg-slate-900/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">
              Segmentação
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Feito sob medida para o seu <span className="text-blue-400">tipo de produto</span>
            </h2>
            <p className="mt-4 text-slate-400 text-base sm:text-lg">
              Qualquer segmento que queira profissionalizar suas vendas e atender clientes com agilidade.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-center hover:border-slate-700 transition-all">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
                <Shirt className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Moda & Vestuário</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Roupas, calçados, bolsas e semijoias com seleção clara de tamanhos, cores e fotos de alta resolução.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-center hover:border-slate-700 transition-all">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4">
                <Headphones className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Eletrônicos & Capinhas</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Celulares, acessórios e periféricos com especificações técnicas e opções de frete rápido para todo o país.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-center hover:border-slate-700 transition-all">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400 mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Cosméticos & Beleza</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Maquiagens, perfumes e produtos de skincare com kits promocionais e cupons de recompra.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-center hover:border-slate-700 transition-all">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Comércio de Bairro</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Docerias, artesanato e lojas físicas que querem um catálogo online prático para receber pedidos organizados no WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS (CARREGADOS DINAMICAMENTE VIA PRISMA) */}
      <section id="planos" className="border-t border-slate-800/80 bg-slate-900/40 py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">
            Investimento Acessível
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {plans.length > 0
              ? `Planos a partir de ${formatCurrency(plans[0].priceMonthly / 100)}/mês`
              : "Escolha o Plano Ideal"}
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            14 dias de teste grátis. Cancele quando quiser, sem letras miúdas.
          </p>

          <div className="mt-14 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const isPopular = index === 1 || plan.name.toLowerCase().includes("pro");
              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl border p-8 flex flex-col h-full relative transition-all duration-300 ${
                    isPopular
                      ? "border-blue-500 bg-gradient-to-b from-blue-600/10 via-slate-900/80 to-slate-900 shadow-2xl shadow-blue-900/30 scale-105 z-10"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-md">
                      Mais Escolhido
                    </div>
                  )}

                  <div className="text-left mb-6">
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="mt-2 text-3xl font-extrabold text-blue-400">
                      {formatCurrency(plan.priceMonthly / 100)}
                      <span className="text-sm text-slate-500 font-normal">/mês</span>
                    </p>
                  </div>

                  <div className="text-left flex-1 border-t border-slate-800/80 pt-6 space-y-3.5 mb-8">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-200">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Até {plan.maxProducts} produtos cadastrados</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Inteligência Artificial para descrições</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Pagamentos no Pix e Cartão</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Checkout integrado e pedido no WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Cupons e banners promocionais</span>
                    </div>
                    {plan.description && (
                      <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto">
                    <Link href={`/register?plan=${plan.id}`}>
                      <Button
                        className={`w-full font-bold h-12 rounded-xl text-base ${
                          isPopular
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
                            : "bg-slate-800 hover:bg-slate-700 text-white"
                        }`}
                      >
                        Começar 14 dias grátis
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}

            {plans.length === 0 && (
              <p className="col-span-3 text-slate-500 py-12">
                Planos em atualização no banco de dados...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FAQ SECTION (ACCORDION NATIVO TAILWIND) */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">
            Tire Suas Dúvidas
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Perguntas <span className="text-blue-400">Frequentes</span>
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            Tudo o que você precisa saber para começar a vender online com segurança hoje mesmo.
          </p>
        </div>

        <div className="space-y-4">
          <details className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-bold text-white text-lg select-none">
              <span>1. Preciso ter CNPJ para abrir a minha loja?</span>
              <ChevronDown className="h-5 w-5 text-blue-400 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Não! Você pode começar vendendo como Pessoa Física (apenas com seu CPF) ou como MEI/CNPJ. O VePix foi criado para apoiar desde quem está começando até grandes lojas estabelecidas.
            </p>
          </details>

          <details className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-bold text-white text-lg select-none">
              <span>2. O VePix cobra porcentagem ou taxa por cada venda?</span>
              <ChevronDown className="h-5 w-5 text-blue-400 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Não cobramos nenhuma taxa sobre suas vendas (0% de comissão). Você paga apenas o valor da sua mensalidade fixa do plano escolhido e 100% do lucro das suas vendas é seu.
            </p>
          </details>

          <details className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-bold text-white text-lg select-none">
              <span>3. Como recebo o dinheiro das compras dos meus clientes?</span>
              <ChevronDown className="h-5 w-5 text-blue-400 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              O dinheiro cai direto na sua conta bancária! Você pode receber via Pix instantâneo ou vincular sua conta do Mercado Pago para aceitar cartões de crédito em até 12x com total segurança antifraude.
            </p>
          </details>

          <details className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-bold text-white text-lg select-none">
              <span>4. Meus clientes precisam baixar algum aplicativo para comprar?</span>
              <ChevronDown className="h-5 w-5 text-blue-400 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Não! A sua loja abre direto no navegador do celular do cliente com carregamento ultra rápido. Ele pode navegar pelos produtos, adicionar ao carrinho e pagar em segundos, sem precisar instalar nada.
            </p>
          </details>

          <details className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-bold text-white text-lg select-none">
              <span>5. Como a Inteligência Artificial ajuda no cadastro dos produtos?</span>
              <ChevronDown className="h-5 w-5 text-blue-400 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Sabemos que escrever descrições é cansativo. No VePix, você apenas digita o nome do produto (ex: "Vestido Midi Floral de Linho") e clica no botão de IA: em segundos ela escreve uma descrição profissional, destacando tecido, estilo e benefícios para convencer o cliente.
            </p>
          </details>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-950 p-10 sm:p-16 text-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-blue-600/10 blur-[100px] pointer-events-none -z-10"></div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">
            Pronto para colocar sua loja no ar e vender mais?
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-xl mx-auto">
            Comece seu teste gratuito de 14 dias hoje mesmo. Sem cartão de crédito e sem complicação.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-13 px-8 text-base shadow-lg shadow-blue-600/40">
                Criar minha loja agora
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <img
              src="/vepix_logo_LP.png"
              alt="VePix"
              className="h-10 w-auto object-contain opacity-80"
            />
            <span className="text-xs text-slate-400">
              Ecossistema Kiron Tech • Atendimento: (79) 99678-1719
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <a href="#como-funciona" className="hover:text-white transition-colors">
              Como Funciona
            </a>
            <a href="#recursos" className="hover:text-white transition-colors">
              Recursos
            </a>
            <a href="#planos" className="hover:text-white transition-colors">
              Planos
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              Dúvidas
            </a>
            <a
              href="https://wa.me/5579996781719?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20o%20atendimento%20do%20VePix."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp: (79) 99678-1719
            </a>
            <Link href="/login" className="hover:text-white transition-colors">
              Painel do Lojista
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            &copy; 2026 VePix. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
