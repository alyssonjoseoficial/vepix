import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { logoUrl: true }
  });

  if (!tenant || !tenant.logoUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const logoUrl = tenant.logoUrl;

  if (logoUrl.startsWith("data:image")) {
    // Extract base64 and content type
    const matches = logoUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 500 });
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // If it's a normal URL (e.g. from Cloudinary), redirect to it
  return NextResponse.redirect(logoUrl);
}
