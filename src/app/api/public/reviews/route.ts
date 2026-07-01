import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, tenantId, name, rating, comment } = body;

    if (!productId || !tenantId || !name || !rating) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        tenantId,
        name,
        rating: Number(rating),
        comment: comment || null
      }
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
