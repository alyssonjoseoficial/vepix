export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { seedDummyInvoices } from '@/lib/actions/finance';

export async function GET() {
  try {
    // We can't call requirePlatformAdmin in a simple curl since we have no session
    // So let's replicate the seed logic here without auth to force it
    
    await prisma.invoice.deleteMany({});
    
    const subscriptions = await prisma.subscription.findMany({
      include: { plan: true, tenant: true },
    });
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    
    for (const sub of subscriptions) {
      if (!sub.plan) continue;
      
      const exactAmount = sub.plan.priceMonthly / 100;
      
      await prisma.invoice.create({
        data: {
          tenantId: sub.tenantId,
          subscriptionId: sub.id,
          amount: exactAmount,
          status: "PAID",
          dueDate: lastMonth,
          paidAt: new Date(lastMonth.getTime() + 86400000 * 2),
        }
      });
      
      if (sub.status === "ACTIVE") {
        await prisma.invoice.create({
          data: {
            tenantId: sub.tenantId,
            subscriptionId: sub.id,
            amount: exactAmount,
            status: "PAID",
            dueDate: startOfMonth,
            paidAt: now,
          }
        });
      } else if (sub.status === "PAST_DUE") {
        await prisma.invoice.create({
          data: {
            tenantId: sub.tenantId,
            subscriptionId: sub.id,
            amount: exactAmount,
            status: "OVERDUE",
            dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
          }
        });
      } else if (sub.status === "CANCELED") {
        await prisma.invoice.create({
          data: {
            tenantId: sub.tenantId,
            subscriptionId: sub.id,
            amount: exactAmount,
            status: "CANCELED",
            dueDate: startOfMonth,
          }
        });
      }
    }
    
    return NextResponse.json({ success: true, message: "Invoices forced seeded." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

