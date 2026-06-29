import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { toggleTenantStatus } from "@/lib/actions/admin";

export default async function AdminTenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      settings: true,
      subscription: { include: { plan: true } },
      members: {
        where: { role: "STORE_OWNER" },
        include: { user: true }
      },
      _count: {
        select: { products: true, orders: true, customers: true }
      }
    }
  });

  if (!tenant) notFound();

  const owner = tenant.members[0]?.user;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ficha da Loja</h1>
          <p className="mt-1 text-sm text-slate-500">ID: {tenant.id}</p>
        </div>
        <a href="/admin/tenants" className="text-sm font-semibold text-blue-600 hover:underline">
          &larr; Voltar para Lojas
        </a>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Card Principal: Loja */}
        <Card className="md:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <CardTitle className="text-xl">Dados da Loja</CardTitle>
              {tenant.active ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">LOJA ATIVA</span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">LOJA SUSPENSA</span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Nome Fantasia</p>
                <p className="font-medium text-slate-900 text-lg">{tenant.name}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Link de Acesso</p>
                <a href={`/${tenant.slug}`} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">
                  /{tenant.slug}
                </a>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Documento (CNPJ/CPF)</p>
                <p className="font-medium text-slate-900">{tenant.settings?.document || "Não informado"}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Criação</p>
                <p className="font-medium text-slate-900">{new Date(tenant.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-500 mb-1">Endereço Físico</p>
                <p className="font-medium text-slate-900">{tenant.settings?.address || "Não informado"}</p>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <CardTitle className="text-lg mb-4">Métricas Atuais</CardTitle>
              <div className="flex gap-8">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Produtos</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{tenant._count.products}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Pedidos</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{tenant._count.orders}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Clientes</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{tenant._count.customers}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {/* Card do Responsável */}
          <Card>
            <div className="p-6">
              <CardTitle className="text-lg mb-4">Dono / Responsável</CardTitle>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Nome Completo</p>
                  <p className="font-medium text-slate-900">{owner?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">E-mail Pessoal</p>
                  <p className="font-medium text-slate-900">{owner?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">E-mail de Contato da Loja</p>
                  <p className="font-medium text-slate-900">{tenant.settings?.contactEmail || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Telefone da Loja</p>
                  <p className="font-medium text-slate-900">{tenant.settings?.contactPhone || "N/A"}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Plano e Ações de Moderação */}
          <Card className="border-red-100 bg-red-50/30">
            <div className="p-6">
              <CardTitle className="text-lg mb-4 text-slate-900">Moderação (Zona de Risco)</CardTitle>
              <p className="text-xs text-slate-600 mb-4">
                Suspender a loja fará com que o link de acesso fique inacessível para clientes e o lojista não poderá realizar vendas.
              </p>
              
              <form action={async () => {
                "use server";
                await toggleTenantStatus(tenant.id);
              }}>
                <button 
                  type="submit"
                  className={`w-full py-2.5 px-4 rounded-md text-sm font-semibold text-white shadow-sm transition-colors ${
                    tenant.active 
                    ? "bg-red-600 hover:bg-red-500" 
                    : "bg-emerald-600 hover:bg-emerald-500"
                  }`}
                >
                  {tenant.active ? "Suspender Loja Imediatamente" : "Reativar Loja"}
                </button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
