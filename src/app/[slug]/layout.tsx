import { getTenantBillingInfo } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StoreBlocked } from "@/components/store/store-blocked";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return {};

  return {
    title: tenant.name,
    description: tenant.description || `Bem-vindo à ${tenant.name}`,
    manifest: `/api/public/${slug}/manifest`,
    themeColor: tenant.primaryColor || "#ffffff",
    appleWebApp: {
      capable: true,
      title: tenant.name,
      statusBarStyle: "default",
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export async function generateViewport({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  
  return {
    themeColor: tenant?.primaryColor || "#ffffff",
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  };
}

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
