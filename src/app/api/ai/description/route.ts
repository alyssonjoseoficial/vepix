import { NextRequest, NextResponse } from "next/server";
import { generateProductDescription } from "@/lib/ai";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const description = await generateProductDescription({
    name: body.name,
    category: body.category,
    price: body.price,
    storeName: body.storeName,
  });

  return NextResponse.json({ description });
}
