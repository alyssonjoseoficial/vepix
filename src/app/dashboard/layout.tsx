import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { getCurrentTenant } from "@/lib/tenant";
import { getTenantBillingInfo } from "@/lib/billing";
import { BillingBlock } from "@/components/dashboard/billing-block";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const billingInfo = await getTenantBillingInfo(tenant.id);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar storeName={tenant.name} storeSlug={tenant.slug} storeLogo={tenant.logoUrl} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-auto p-6 lg:p-10">
          {billingInfo.status === "BLOCKED" ? (
            <BillingBlock tenantId={tenant.id} />
          ) : (
            <>
              {billingInfo.status === "WARNING" && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between shadow-sm">
                  <div>
                    <strong>Atenção:</strong> Sua assinatura vence em {billingInfo.daysRemaining} {billingInfo.daysRemaining === 1 ? 'dia' : 'dias'}. 
                    Para evitar o bloqueio da sua loja, renove agora.
                  </div>
                  <Link href="/dashboard/billing" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm font-medium transition">
                    Renovar Assinatura
                  </Link>
                </div>
              )}
              
              {billingInfo.status === "PAST_DUE" && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between shadow-sm">
                  <div>
                    <strong>Assinatura Vencida:</strong> Você está no período de carência. 
                    Sua loja será bloqueada em {billingInfo.daysRemaining} {billingInfo.daysRemaining === 1 ? 'dia' : 'dias'}.
                  </div>
                  <Link href="/dashboard/billing" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition">
                    Regularizar Agora
                  </Link>
                </div>
              )}
              
              {children}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
