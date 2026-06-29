import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({
    where: { slug },
    include: {
      settings: true,
      subscription: { include: { plan: true } },
    },
  });
}

export async function getCurrentTenant() {
  const session = await auth();
  if (!session?.user?.tenantId) return null;

  return prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    include: {
      settings: true,
      subscription: { include: { plan: true } },
      _count: { select: { products: true, orders: true, customers: true } },
    },
  });
}

export async function requireTenantAccess() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "PLATFORM_ADMIN" || session.user.role === "PLATFORM_OPERATOR") {
    redirect("/admin");
  }

  if (!session?.user?.tenantId) {
    throw new Error("UNAUTHORIZED");
  }

  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("TENANT_NOT_FOUND");

  return { session, tenant };
}

export function isSubscriptionActive(status: string) {
  return status === "ACTIVE" || status === "TRIALING";
}
