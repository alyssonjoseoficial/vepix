"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
};

export function ProductReviews({ productId, tenantId, initialReviews }: { productId: string, tenantId: string, initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || rating < 1 || rating > 5) return;
    setLoading(true);

    try {
      const res = await fetch("/api/public/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, tenantId, name, rating, comment })
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.review, ...reviews]);
        setName("");
        setRating(5);
        setComment("");
      } else {
        alert(data.error || "Erro ao salvar avaliação");
      }
    } catch (e) {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="mt-12 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Avaliações dos Compradores</h2>
      
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl md:w-1/3">
          <div className="text-4xl font-extrabold text-slate-900">{averageRating}</div>
          <div className="flex text-amber-400 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-5 h-5 ${star <= Number(averageRating) ? "fill-amber-400" : "text-slate-300"}`} />
            ))}
          </div>
          <div className="text-sm text-slate-500">{reviews.length} avaliações</div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
          <h3 className="font-semibold text-slate-800">Deixe sua avaliação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Seu Nome</label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Como você se chama?" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Nota (1 a 5)</label>
              <select 
                value={rating} 
                onChange={e => setRating(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} Estrelas</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Comentário sobre o produto</label>
            <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="O que você achou deste produto?" />
          </div>
          <Button type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar Avaliação"}</Button>
        </form>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Ainda não há avaliações para este produto. Seja o primeiro a avaliar!</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-slate-900">{review.name}</span>
                <span className="text-xs text-slate-400">• {new Date(review.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex text-amber-400 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-3 h-3 ${star <= review.rating ? "fill-amber-400" : "text-slate-300"}`} />
                ))}
              </div>
              {review.comment && <p className="text-sm text-slate-600">{review.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
