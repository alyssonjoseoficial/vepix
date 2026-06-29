import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoreHeader } from "@/components/store/header";
import { Button } from "@/components/ui/button";
import { CartProvider } from "@/components/store/cart-context";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Truck, Calendar, Package, Copy } from "lucide-react";
import { MercadoPagoConfig, Payment } from "mercadopago";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ slug: string; orderId: string }>;
}) {
  const { slug, orderId } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: { settings: true },
  });
  if (!tenant) notFound();

  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId: tenant.id },
    include: { items: true },
  });
  if (!order) notFound();

  let qrCode = null;
  let qrCodeBase64 = null;

  if (order.status === "PENDING" && order.paymentMethod === "PIX" && order.trackingCode && tenant.settings?.mpAccessToken) {
    try {
      const client = new MercadoPagoConfig({ accessToken: tenant.settings.mpAccessToken });
      const payment = new Payment(client);
      const mpPayment = await payment.get({ id: order.trackingCode });
      
      qrCode = mpPayment.point_of_interaction?.transaction_data?.qr_code;
      qrCodeBase64 = mpPayment.point_of_interaction?.transaction_data?.qr_code_base64;
    } catch (e) {
      console.error("Erro ao buscar QR Code:", e);
    }
  }

  return (
    <CartProvider storeSlug={slug}>
      <div className="min-h-screen bg-slate-50">
      <StoreHeader store={tenant} />
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          {order.status === "PENDING" ? "Pedido realizado!" : "Informações do Pedido"}
        </h1>
        <p className="mt-3 text-slate-500">
          Pedido <strong>#{order.id.slice(-8)}</strong> — {formatCurrency(Number(order.total))}
        </p>

        {order.status === "SHIPPED" && (
          <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 text-left">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-blue-900">Seu pedido está a caminho!</h2>
            </div>
            {order.trackingCode && (
              <p className="mt-4 text-sm text-blue-800">
                Código de Rastreio: <strong className="rounded-md bg-blue-100 px-2 py-1 text-base tracking-widest">{order.trackingCode}</strong>
              </p>
            )}
            {order.estimatedDelivery && (
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-800">
                <Calendar className="h-4 w-4" />
                <span>Previsão de entrega: <strong>{new Date(order.estimatedDelivery).toLocaleDateString("pt-BR")}</strong></span>
              </div>
            )}
          </div>
        )}

        {order.status === "DELIVERED" && (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-left">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-emerald-900">Pedido Entregue!</h2>
            </div>
            <p className="mt-2 text-sm text-emerald-800">Esperamos que você tenha gostado da sua compra.</p>
          </div>
        )}

        {order.status === "PENDING" && order.paymentMethod === "PIX" && (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
            <h2 className="text-xl font-bold text-emerald-900 mb-2">Pagamento via PIX</h2>
            <p className="text-sm text-emerald-800 mb-6">
              Escaneie o QR Code abaixo com o aplicativo do seu banco ou copie o código Pix.
            </p>

            {qrCodeBase64 ? (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl shadow-sm inline-block">
                  <img src={`data:image/jpeg;base64,${qrCodeBase64}`} alt="QR Code PIX" className="w-48 h-48 object-contain" />
                </div>
                
                <div className="mt-6 w-full max-w-sm">
                  <p className="text-xs font-semibold text-emerald-700 uppercase mb-2 text-left">Pix Copia e Cola</p>
                  <div className="flex bg-white border border-emerald-200 rounded-lg overflow-hidden">
                    <input 
                      type="text" 
                      readOnly 
                      value={qrCode || ""} 
                      className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-600 focus:outline-none"
                    />
                  </div>
                  <p className="mt-3 text-xs text-emerald-600 font-medium">
                    Após o pagamento, esta página será atualizada (ou você receberá confirmação por e-mail).
                  </p>
                </div>
              </div>
            ) : tenant.settings?.pixKey ? (
              <div className="text-left bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
                <p className="font-semibold text-emerald-900">Transferência PIX Direta</p>
                <p className="mt-2 text-sm text-slate-600">
                  Chave: <strong className="text-slate-900 bg-slate-100 px-2 py-1 rounded">{tenant.settings.pixKey}</strong>
                </p>
                <p className="mt-3 text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
                  ⚠️ Envie o comprovante para {tenant.settings.contactEmail ?? "o vendedor"}.
                </p>
              </div>
            ) : (
              <p className="text-sm text-red-600">Erro: Não foi possível gerar o código PIX.</p>
            )}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-left">
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <Package className="h-4 w-4 text-slate-400" /> Endereço de Entrega
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {order.shippingAddress || "Endereço não informado."}
            <br />
            {order.shippingZipCode ? `CEP: ${order.shippingZipCode}` : ""}
          </p>
        </div>

        <Link href={`/${slug}`}>
          <Button className="mt-8">Voltar à loja</Button>
        </Link>
      </div>
      </div>
    </CartProvider>
  );
}
