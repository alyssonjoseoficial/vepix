import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from './src/lib/prisma';

async function main() {
  const d = new Date();
  d.setDate(d.getDate() - 15);
  await prisma.tenant.update({
    where: { slug: 'lojinhadavovo' },
    data: { createdAt: d }
  });
  console.log("Data de createdAt atualizada para 15 dias atrás.");
}

main().catch(e => console.error(e));
