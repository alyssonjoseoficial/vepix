import { getTenantBillingInfo } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StoreBlocked } from "@/components/store/store-blocked";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  const tenant = await prisma.tenant.findUnique({
    where: { slug }
  });

  if (!tenant) notFound();

  // Se for inativo administrativamente, block
  if (!tenant.active) {
    return <StoreBlocked storeName={tenant.name} reason="SUSPENDED" />;
  }

  // Verifica billing (14 dias ou pagamento)
  const billing = await getTenantBillingInfo(tenant.id);
  
  if (billing.status === "BLOCKED") {
    return <StoreBlocked storeName={tenant.name} reason="BILLING" />;
  }

  return <>{children}</>;
}
