import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoreCartPage } from "@/components/store/cart-page";

export default async function CartPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({ 
    where: { slug },
    include: { settings: true }
  });
  if (!tenant) notFound();

  const serializedTenant = {
    ...tenant,
    settings: tenant.settings ? {
      ...tenant.settings,
      freeShippingMinAmount: tenant.settings.freeShippingMinAmount ? Number(tenant.settings.freeShippingMinAmount) : null
    } : null
  };

  return <StoreCartPage slug={slug} store={serializedTenant} />;
}
