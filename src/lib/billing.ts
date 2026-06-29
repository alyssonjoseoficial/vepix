import { prisma } from "./prisma";

export type BillingStatus = "TRIAL" | "ACTIVE" | "WARNING" | "PAST_DUE" | "BLOCKED";

export interface TenantBillingInfo {
  status: BillingStatus;
  daysRemaining: number;
  trialEndsAt: Date;
  currentPeriodEnd: Date | null;
  subscription: any | null;
}

export async function getTenantBillingInfo(tenantId: string): Promise<TenantBillingInfo> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { subscription: true },
  });

  if (!tenant) {
    throw new Error("Tenant não encontrado");
  }

  const now = new Date();
  
  // Trial de 14 dias a partir da criação da loja
  const trialEndsAt = new Date(tenant.createdAt);
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const isTrialActive = now <= trialEndsAt;
  
  const subscription = tenant.subscription;
  const currentPeriodEnd = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
  
  let status: BillingStatus;
  let daysRemaining = 0;

  if (subscription?.status === "ACTIVE" && currentPeriodEnd) {
    const timeDiff = currentPeriodEnd.getTime() - now.getTime();
    const daysToExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysToExpiration > 5) {
      status = "ACTIVE";
      daysRemaining = daysToExpiration;
    } else if (daysToExpiration >= 0 && daysToExpiration <= 5) {
      status = "WARNING";
      daysRemaining = daysToExpiration;
    } else if (daysToExpiration < 0 && daysToExpiration >= -5) {
      status = "PAST_DUE";
      daysRemaining = Math.abs(daysToExpiration);
    } else {
      status = "BLOCKED";
    }
  } else if (isTrialActive) {
    const daysToTrialEnd = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysToTrialEnd <= 5) {
      status = "WARNING";
      daysRemaining = daysToTrialEnd;
    } else {
      status = "TRIAL";
      daysRemaining = daysToTrialEnd;
    }
  } else {
    // Passou o trial e não tem assinatura ativa
    status = "BLOCKED";
  }

  return {
    status,
    daysRemaining,
    trialEndsAt,
    currentPeriodEnd,
    subscription,
  };
}
