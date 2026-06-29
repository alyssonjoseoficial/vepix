"use client";

import { useState } from "react";
import { createProduct, updateProduct, upgradeSubscription } from "@/lib/actions/store";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { AiDescriptionButton } from "@/components/dashboard/ai-description-button";
import { MultiImageInput } from "@/components/dashboard/multi-image-input";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  name: string;
  priceMonthly: number;
  maxProducts: number;
};

export function ProductForm({ categories, editingProduct }: { categories: any[], editingProduct: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradePlan, setUpgradePlan] = useState<Plan | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUpgradePlan(null);

    const formData = new FormData(e.currentTarget);
    const action = editingProduct ? updateProduct : createProduct;

    const result = await action(formData);

    if (result?.error === "PLAN_LIMIT_REACHED" && result.nextPlan) {
      setUpgradePlan(result.nextPlan as Plan);
    } else if (result?.error === "MAX_PLATFORM_LIMIT_REACHED") {
      setError("Você atingiu o limite máximo de produtos suportado pela plataforma.");
    } else if (result?.error) {
      setError(result.error);
    } else {
      router.push("/dashboard/products");
    }

    setLoading(false);
  }

  async function handleUpgrade() {
    if (!upgradePlan) return;
    setUpgrading(true);
    const result = await upgradeSubscription(upgradePlan.id);
    if (result?.success) {
      // Após upgrade com sucesso, o limite aumentou.
      // O usuário pode submeter o formulário novamente.
      setUpgradePlan(null);
      setError("Plano atualizado com sucesso! Clique em 'Publicar produto' novamente.");
    } else {
      setError(result?.error || "Erro ao fazer upgrade do plano.");
    }
    setUpgrading(false);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {editingProduct && <input type="hidden" name="id" value={editingProduct.id} />}
        <div>
          <Label>Imagens do Produto</Label>
          <div className="mt-2">
            <MultiImageInput name="imageUrls" defaultValues={editingProduct?.imageUrls || []} />
          </div>
        </div>
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" required defaultValue={editingProduct?.name || ""} />
        </div>
        <div>
          <Label htmlFor="categoryId">Categoria</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={editingProduct?.categoryId || ""}
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
          >
            <option value="">Sem categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={editingProduct ? Number(editingProduct.price) : ""}
            />
          </div>
          <div>
            <Label htmlFor="stock">Estoque</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              defaultValue={editingProduct?.stock ?? 1}
            />
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="description">Descrição</Label>
            <AiDescriptionButton />
          </div>
          <Textarea
            id="description"
            name="description"
            required
            defaultValue={editingProduct?.description || ""}
          />
        </div>
        <label className="flex items-center justify-between rounded-xl border border-slate-100 p-4 cursor-pointer hover:bg-slate-50">
          <div className="space-y-0.5">
            <div className="font-medium">Produto em Destaque</div>
            <p className="text-sm text-slate-500">Exibir este produto na seção de destaques da página inicial.</p>
          </div>
          <input
            type="checkbox"
            name="featured"
            defaultChecked={editingProduct?.featured || false}
            className="h-5 w-5 accent-slate-900"
          />
        </label>
        <label className="flex items-center justify-between rounded-xl border border-blue-200 p-4 bg-blue-50/50 cursor-pointer hover:bg-blue-50">
          <div className="space-y-0.5">
            <div className="font-medium text-blue-700">Adicionar à Mega Oferta</div>
            <p className="text-sm text-blue-600/80">Exibir este produto no banner principal giratório de ofertas relâmpago.</p>
          </div>
          <input
            type="checkbox"
            name="isMegaOffer"
            defaultChecked={editingProduct?.isMegaOffer || false}
            className="h-5 w-5 accent-blue-600"
          />
        </label>
        <label className="flex items-center justify-between rounded-xl border border-emerald-200 p-4 bg-emerald-50/50 cursor-pointer hover:bg-emerald-50">
          <div className="space-y-0.5">
            <div className="font-medium text-emerald-700">Frete Grátis</div>
            <p className="text-sm text-emerald-600/80">Oferecer frete grátis para este produto.</p>
          </div>
          <input
            type="checkbox"
            name="freeShipping"
            defaultChecked={editingProduct?.freeShipping || false}
            className="h-5 w-5 accent-emerald-600"
          />
        </label>
        
        {error && (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Salvando..." : (editingProduct ? "Salvar alterações" : "Publicar produto")}
          </Button>
          {editingProduct && (
            <Link href="/dashboard/products" className="flex-1">
              <Button type="button" variant="secondary" className="w-full">
                Cancelar
              </Button>
            </Link>
          )}
        </div>
      </form>

      {/* Modal de Upgrade */}
      {upgradePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h3 className="mt-4 text-center text-lg font-bold text-slate-900">Limite Atingido</h3>
            <p className="mt-2 text-center text-sm text-slate-500">
              Sua loja atingiu a capacidade máxima de produtos do seu plano atual. Deseja fazer um upgrade para continuar crescendo?
            </p>
            
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Próximo Plano</p>
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-900">{upgradePlan.name}</p>
                <p className="font-bold text-slate-900">{formatCurrency(upgradePlan.priceMonthly / 100)} <span className="text-xs text-slate-500 font-normal">/mês</span></p>
              </div>
              <p className="mt-1 text-sm text-slate-600">Limite de <strong>{upgradePlan.maxProducts}</strong> produtos</p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button onClick={handleUpgrade} disabled={upgrading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {upgrading ? "Processando upgrade..." : "Sim, Concordo e Quero Fazer Upgrade"}
              </Button>
              <Button onClick={() => setUpgradePlan(null)} disabled={upgrading} variant="outline" className="w-full">
                Cancelar
              </Button>
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              Ao confirmar, os termos do novo plano entram em vigor imediatamente.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
