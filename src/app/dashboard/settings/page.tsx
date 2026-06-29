import { requireTenantAccess } from "@/lib/tenant";
import { updateStoreSettings } from "@/lib/actions/store";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { BannerSettingsFields } from "@/components/dashboard/banner-settings-fields";

export default async function SettingsPage() {
  const { tenant } = await requireTenantAccess();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Configurações da loja</h1>
      <Card>
        <CardTitle>Identidade visual e contato</CardTitle>
        <form action={updateStoreSettings} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="logo">Logo da Loja</Label>
            <div className="mt-2 flex items-center gap-4">
              {tenant.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tenant.logoUrl} alt="Logo Atual" className="h-16 w-16 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 border border-slate-200">
                  {tenant.name.charAt(0)}
                </div>
              )}
              <Input id="logo" name="logo" type="file" accept="image/*" className="max-w-xs" />
            </div>
            <p className="mt-1 text-xs text-slate-500">Envie uma imagem quadrada (JPG, PNG) para melhor resultado.</p>
          </div>
          <div>
            <Label htmlFor="name">Nome da loja</Label>
            <Input id="name" name="name" defaultValue={tenant.name} required />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" defaultValue={tenant.description ?? ""} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="primaryColor">Cor primária</Label>
              <Input id="primaryColor" name="primaryColor" type="color" defaultValue={tenant.primaryColor} />
            </div>
            <div>
              <Label htmlFor="secondaryColor">Cor secundária</Label>
              <Input id="secondaryColor" name="secondaryColor" type="color" defaultValue={tenant.secondaryColor} />
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-semibold text-slate-900">Configurações de Pagamento</h3>
            <div>
              <Label htmlFor="mpAccessToken">Mercado Pago - Access Token (Checkout Cartão e PIX)</Label>
              <Input
                id="mpAccessToken"
                name="mpAccessToken"
                defaultValue={tenant.settings?.mpAccessToken || ""}
                placeholder="APP_USR-..."
              />
              <p className="mt-1 text-xs text-slate-500">
                Necessário para processar pagamentos na sua loja. Obtenha no painel de desenvolvedor do Mercado Pago.
              </p>
            </div>
            
            <div>
              <Label htmlFor="mpPublicKey">Mercado Pago - Public Key</Label>
              <Input
                id="mpPublicKey"
                name="mpPublicKey"
                defaultValue={tenant.settings?.mpPublicKey || ""}
                placeholder="APP_USR-..."
              />
              <p className="mt-1 text-xs text-slate-500">
                Usada para renderizar o checkout transparente no navegador do cliente.
              </p>
            </div>

            <div>
              <Label htmlFor="pixKey">Chave PIX Manual (Opcional - Transferência Direta)</Label>
              <Input
                id="pixKey"
                name="pixKey"
                defaultValue={tenant.settings?.pixKey || ""}
                placeholder="Seu CPF, CNPJ, E-mail ou Telefone"
              />
              <p className="mt-1 text-xs text-slate-500">
                Só preencha se quiser oferecer a opção de PIX manual onde você confere o comprovante.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="contactEmail">E-mail de contato</Label>
              <Input id="contactEmail" name="contactEmail" type="email" defaultValue={tenant.settings?.contactEmail ?? ""} />
            </div>
            <div>
              <Label htmlFor="contactPhone">Telefone</Label>
              <Input id="contactPhone" name="contactPhone" defaultValue={tenant.settings?.contactPhone ?? ""} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="document">Documento (CNPJ ou CPF)</Label>
              <Input id="document" name="document" defaultValue={tenant.settings?.document ?? ""} required placeholder="Apenas números ou com formatação" />
            </div>
            <div>
              <Label htmlFor="address">Endereço Físico completo</Label>
              <Input id="address" name="address" defaultValue={tenant.settings?.address ?? ""} required placeholder="Rua, Número, Bairro, Cidade, CEP" />
            </div>
          </div>

          <hr className="my-6 border-slate-200" />
          <h2 className="text-xl font-bold text-slate-900 mb-4">Gamificação e Banners</h2>
          
          <div className="grid gap-4 sm:grid-cols-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="col-span-2">
              <Label htmlFor="freeShippingMinAmount" className="text-blue-700 font-bold">Valor Mínimo para Frete Grátis (R$)</Label>
              <Input id="freeShippingMinAmount" name="freeShippingMinAmount" type="number" step="0.01" defaultValue={tenant.settings?.freeShippingMinAmount ? Number(tenant.settings.freeShippingMinAmount) : ""} placeholder="Ex: 300.00" />
              <p className="mt-1 text-xs text-slate-500">Deixe em branco para não oferecer frete grátis por valor.</p>
            </div>
          </div>

          <BannerSettingsFields 
            settings={tenant.settings ? {
              ...tenant.settings,
              freeShippingMinAmount: tenant.settings.freeShippingMinAmount ? Number(tenant.settings.freeShippingMinAmount) : null
            } : null} 
          />
          <Button type="submit">Salvar alterações</Button>
        </form>
      </Card>
    </div>
  );
}
