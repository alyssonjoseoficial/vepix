import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // 1. Reverter a cicera para STORE_OWNER
    const cicera = await prisma.user.findUnique({ where: { email: "cicera@gmail.com" } });
    if (cicera) {
      await prisma.user.update({
        where: { email: "cicera@gmail.com" },
        data: { role: "STORE_OWNER" }
      });
    }

    // 2. Criar ou atualizar o superadmin
    const email = "superadmin@storeflow.com";
    const passwordHash = await bcrypt.hash("123456", 10);

    const superadmin = await prisma.user.upsert({
      where: { email },
      update: {
        role: "PLATFORM_ADMIN",
        passwordHash,
      },
      create: {
        name: "Super Admin",
        email,
        passwordHash,
        role: "PLATFORM_ADMIN",
      }
    });

    return NextResponse.json({ success: true, superadminEmail: superadmin.email });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
