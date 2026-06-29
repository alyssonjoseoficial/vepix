import { prisma } from "@/lib/prisma";
import { requireTenantAccess } from "@/lib/tenant";
import { createCategory, deleteCategory } from "@/lib/actions/store";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { CategoryListItem } from "@/components/dashboard/category-list-item";

export default async function CategoriesPage() {
  const { tenant } = await requireTenantAccess();
  const categories = await prisma.category.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
      <Card>
        <CardTitle>Nova categoria</CardTitle>
        <form action={createCategory} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required placeholder="Ex: Eletrônicos" />
          </div>
          <Button type="submit" className="w-full">
            Criar categoria
          </Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Categorias</CardTitle>
        <div className="mt-6 space-y-3">
          {categories.map((category) => (
            <CategoryListItem key={category.id} category={category} />
          ))}
        </div>
      </Card>
    </div>
  );
}
