import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            memberships: {
              include: { tenant: true },
              take: 1,
            },
          },
        });

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const membership = user.memberships[0];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: membership?.tenantId ?? null,
          tenantSlug: membership?.tenant.slug ?? null,
        };
      },
    }),
    Credentials({
      id: "sso",
      name: "sso",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        
        const tokenStr = credentials.token as string;
        // Chave secreta do Vepix no Control_SADMIN
        const secretKey = 'vepix_secret_key_2026!@#';
        
        const parts = tokenStr.split('.');
        if (parts.length !== 3) {
          console.log("SSO ERRO: Token não tem 3 partes.");
          return null;
        }
        
        const [header, payload, signature] = parts;
        
        const crypto = require('crypto');
        const expectedSig = crypto.createHmac('sha256', secretKey)
                                  .update(`${header}.${payload}`)
                                  .digest('base64url');
                                  
        if (expectedSig !== signature) {
          console.log("SSO ERRO: Assinatura não bate!", { expected: expectedSig, received: signature });
          return null;
        }
        
        // Decodificando Payload
        const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
        console.log("SSO Payload:", decodedPayload);
        
        if (decodedPayload.exp * 1000 < Date.now()) {
          console.log("SSO ERRO: Token expirado!");
          return null;
        }
        
        // Se a assinatura bate e não expirou, achar o Admin do Vepix
        const user = await prisma.user.findFirst({
          where: { role: 'PLATFORM_ADMIN' },
          include: {
            memberships: {
              include: { tenant: true },
              take: 1,
            },
          },
        });
        
        if (!user) {
          console.log("SSO ERRO: Usuário PLATFORM_ADMIN não encontrado!");
          return null;
        }
        
        const membership = user.memberships[0];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: membership?.tenantId ?? null,
          tenantSlug: membership?.tenant.slug ?? null,
        };
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
      }

      if (trigger === "update" && session) {
        token.tenantId = session.tenantId ?? token.tenantId;
        token.tenantSlug = session.tenantSlug ?? token.tenantSlug;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string | null;
        session.user.tenantSlug = token.tenantSlug as string | null;
      }
      return session;
    },
  },
});
