import { prisma } from "@/lib/prisma";
import { requireTenantAccess } from "@/lib/tenant";
import { deleteCoupon } from "@/lib/actions/coupons";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { CouponForm } from "./coupon-form";

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { tenant } = await requireTenantAccess();
  const { edit } = await searchParams;

  const coupons = await prisma.coupon.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
  });

  let editingCoupon = null;
  if (edit) {
    const c = coupons.find((c) => c.id === edit);
    if (c) {
      editingCoupon = {
        ...c,
        discountValue: Number(c.discountValue),
        minOrderValue: c.minOrderValue ? Number(c.minOrderValue) : null,
      };
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
      <Card>
        <CardTitle>{editingCoupon ? "Editar cupom" : "Novo cupom"}</CardTitle>
        <CouponForm key={editingCoupon?.id || "new"} tenantId={tenant.id} editingCoupon={editingCoupon} />
      </Card>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <CardTitle>Cupons ({coupons.length})</CardTitle>
        </div>

        <div className="mt-6 space-y-4">
          {coupons.length === 0 ? (
            <p className="text-slate-400">Nenhum cupom cadastrado.</p>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-lg uppercase">{coupon.code}</p>
                    {!coupon.active && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Inativo</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    Desconto: {coupon.discountType === "PERCENTAGE" ? `${Number(coupon.discountValue)}%` : formatCurrency(Number(coupon.discountValue))}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {coupon.currentUses} usos {coupon.maxUses ? `/ ${coupon.maxUses}` : ""}
                    {coupon.expiresAt ? ` · Validade: ${new Date(coupon.expiresAt).toLocaleDateString("pt-BR")}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/coupons?edit=${coupon.id}`}>
                    <Button type="button" variant="secondary" size="sm">
                      Editar
                    </Button>
                  </Link>
                  <form action={deleteCoupon.bind(null, coupon.id)}>
                    <Button type="submit" variant="destructive" size="sm">
                      Excluir
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
