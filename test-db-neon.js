const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const tenants = await prisma.tenant.count();
  console.log(`Users: ${users}, Tenants: ${tenants}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
