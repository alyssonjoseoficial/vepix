import { prisma } from './src/lib/prisma';

async function main() {
  const products = await prisma.product.findMany({
    where: { isMegaOffer: true },
    select: { name: true, imageUrls: true }
  });
  console.log(JSON.stringify(products, null, 2));
}

main().finally(() => prisma.$disconnect());
