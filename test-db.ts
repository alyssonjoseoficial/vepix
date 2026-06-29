import { PrismaClient } from './src/generated/prisma/index.js';
import * as dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient();
async function main() {
  const product = await prisma.product.findUnique({
    where: { id: 'cmqvrz8280004kklwzfvfvyjx' }
  });
  console.log('Product cmqvr...:', product);
  
  const allProducts = await prisma.product.findMany();
  console.log('All Products:', allProducts.map(p => ({id: p.id, name: p.name, active: p.active})));
}
main();
