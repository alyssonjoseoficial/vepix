import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoreCheckoutPage } from "@/components/store/checkout-page";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: { settings: true },
  });
  if (!tenant) notFound();

  const serializedTenant = {
    ...tenant,
    settings: tenant.settings ? {
      ...tenant.settings,
      freeShippingMinAmount: tenant.settings.freeShippingMinAmount ? Number(tenant.settings.freeShippingMinAmount) : null
    } : null
  };

  return (
    <StoreCheckoutPage
      slug={slug}
      store={serializedTenant}
      pixKey={tenant.settings?.pixKey}
    />
  );
}
