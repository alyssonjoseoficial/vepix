import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const PLANS = [
  {
    slug: "starter",
    name: "Starter",
    description: "Ideal para começar a vender online",
    priceMonthly: 4900,
    maxProducts: 50,
    stripePriceId: process.env.STRIPE_PRICE_STARTER || "price_1StarterMock",
  },
  {
    slug: "growth",
    name: "Growth",
    description: "Para lojas em crescimento",
    priceMonthly: 9900,
    maxProducts: 500,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH || "price_1GrowthMock",
  },
  {
    slug: "pro",
    name: "Pro",
    description: "Recursos avançados e escala",
    priceMonthly: 19900,
    maxProducts: 5000,
    stripePriceId: process.env.STRIPE_PRICE_PRO || "price_1ProMock",
  },
] as const;
