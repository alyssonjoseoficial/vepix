"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteCategory, updateCategory } from "@/lib/actions/store";

export function CategoryListItem({ 
  category 
}: { 
  category: { id: string; name: string; _count: { products: number } } 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await updateCategory(category.id, formData);
    setLoading(false);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <form onSubmit={handleUpdate} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 gap-4">
        <div className="flex-1">
          <Input 
            name="name" 
            defaultValue={category.name} 
            required 
            autoFocus 
            disabled={loading}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
      <div>
        <p className="font-semibold">{category.name}</p>
        <p className="text-sm text-slate-500">
          {category._count.products} produto(s)
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          Editar
        </Button>
        <form action={deleteCategory.bind(null, category.id)}>
          <Button type="submit" variant="destructive" size="sm">
            Excluir
          </Button>
        </form>
      </div>
    </div>
  );
}
