# StoreFlow — SaaS Multi-tenant E-commerce

Plataforma moderna de e-commerce construída com **Next.js 16**, **Prisma**, **Neon PostgreSQL** e deploy no **Render**.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend + API | Next.js 16 (App Router) |
| Banco | Neon PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (Credentials) |
| IA | Google Gemini (gratuito) |
| Pagamentos SaaS | Stripe (configurável) |
| Deploy | Render |

## Setup local

### 1. Neon (banco de dados)

1. Crie um projeto em [neon.tech](https://neon.tech)
2. Copie a connection string PostgreSQL
3. Cole em `saas/.env`:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="gere-uma-chave-secreta"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GEMINI_API_KEY="sua-chave-gemini"
```

### 2. Instalar e rodar

```bash
cd saas
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Acesse: http://localhost:3000

### 3. Fluxo

1. **/** — Landing page
2. **/register** — Criar conta + loja (trial 14 dias)
3. **/dashboard** — Painel do lojista
4. **/loja/[slug]** — Loja pública do tenant

## Deploy no Render

1. Conecte o repositório no Render
2. Use o `render.yaml` na raiz (rootDir: `saas`)
3. Configure as variáveis de ambiente (DATABASE_URL do Neon, AUTH_SECRET, etc.)
4. Após deploy, rode migrations:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## Estrutura

```
saas/
├── prisma/schema.prisma    # Modelo multi-tenant
├── src/app/
│   ├── page.tsx            # Landing
│   ├── dashboard/          # Painel lojista
│   └── loja/[slug]/        # Loja pública
├── src/lib/
│   ├── auth.ts
│   ├── tenant.ts
│   ├── ai.ts               # Gemini
│   └── actions/            # Server Actions
└── render.yaml (na raiz)
```

## Legado

O código PHP antigo permanece na raiz do projeto (`index.php`, `admin/`, etc.) para referência. O novo sistema está em `saas/`.

## Próximos passos (pós-MVP)

- [ ] Stripe Checkout para assinatura mensal
- [ ] Upload de imagens (Cloudinary/S3)
- [ ] Domínio customizado por tenant
- [ ] Busca semântica com IA
- [ ] Chatbot de atendimento
