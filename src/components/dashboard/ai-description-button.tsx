"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AiDescriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    const name = (document.getElementById("name") as HTMLInputElement)?.value;
    const price = (document.getElementById("price") as HTMLInputElement)?.value;
    const categorySelect = document.getElementById("categoryId") as HTMLSelectElement;
    const category = categorySelect?.selectedOptions[0]?.text;

    if (!name) {
      alert("Informe o nome do produto primeiro.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: parseFloat(price), category }),
      });
      const data = await res.json();
      const textarea = document.getElementById("description") as HTMLTextAreaElement;
      if (textarea && data.description) textarea.value = data.description;
    } catch {
      alert("Erro ao gerar descrição.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleGenerate} disabled={loading}>
      <Sparkles className="h-4 w-4" />
      {loading ? "Gerando..." : "IA"}
    </Button>
  );
}
