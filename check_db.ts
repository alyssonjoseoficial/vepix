import { PrismaClient } from './src/generated/prisma/client/index.js';
const prisma = new PrismaClient();

async function check() {
  const c = await prisma.user.findUnique({ where: { email: "cicera@gmail.com" }, include: { memberships: true } });
  console.log("Cicera:", JSON.stringify(c, null, 2));
  
  const s = await prisma.user.findUnique({ where: { email: "superadmin@storeflow.com" }, include: { memberships: true } });
  console.log("Superadmin:", JSON.stringify(s, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
