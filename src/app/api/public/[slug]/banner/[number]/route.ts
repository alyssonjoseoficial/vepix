import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; number: string }> }
) {
  try {
    const { slug, number } = await params;
    
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: { settings: true },
    });

    if (!tenant || !tenant.settings) {
      return new NextResponse("Not found", { status: 404 });
    }

    const bannerField = `banner${number}ImageUrl` as keyof typeof tenant.settings;
    const bannerUrl = tenant.settings[bannerField] as string | null;

    if (!bannerUrl || !bannerUrl.startsWith("data:image")) {
      return new NextResponse("Not found or not base64", { status: 404 });
    }

    const matches = bannerUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return new NextResponse("Invalid base64", { status: 400 });
    }

    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=31536000",
      },
    });
  } catch (error) {
    console.error("Banner API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
