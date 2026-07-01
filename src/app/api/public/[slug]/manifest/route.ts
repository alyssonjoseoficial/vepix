import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const tenant = await prisma.tenant.findUnique({
    where: { slug }
  });

  if (!tenant) {
    return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
  }

  const manifest = {
    name: tenant.name,
    short_name: tenant.name,
    description: tenant.description || `Loja ${tenant.name}`,
    start_url: `/${slug}`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: tenant.primaryColor || "#ee4d2d",
    icons: [
      {
        src: tenant.logoUrl || "/favicon.ico",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: tenant.logoUrl || "/favicon.ico",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };

  return NextResponse.json(manifest);
}
