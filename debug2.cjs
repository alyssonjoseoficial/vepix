require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { PrismaClient } = require('./src/generated/prisma/index.js');
const prisma = new PrismaClient();

async function run() {
  const plans = await prisma.plan.findMany();
  console.log("Plans:", JSON.stringify(plans, null, 2));
  const invoices = await prisma.invoice.findMany();
  console.log("Invoices:", JSON.stringify(invoices, null, 2));
}
run();
