import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token SSO ausente" }, { status: 400 });
  }

  try {
    // O NextAuth fará o login usando o nosso provider 'sso' e redirecionará para o dashboard do superadmin
    await signIn("sso", { token, redirectTo: "/admin" });
  } catch (error: any) {
    // O Next.js usa throw errors para redirecionamentos. Se for um erro de redirecionamento, repassamos.
    if (error.message && error.message.includes('NEXT_REDIRECT')) {
        throw error;
    }
    
    console.error("Erro no Login SSO:", error);
    return NextResponse.json({ error: "Falha na autenticação SSO ou token inválido/expirado." }, { status: 401 });
  }
}
