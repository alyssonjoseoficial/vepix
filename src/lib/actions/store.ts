"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenantAccess } from "@/lib/tenant";
import { slugify } from "@/lib/utils";
import { generateProductDescription } from "@/lib/ai";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function createCategory(formData: FormData): Promise<void> {
  const { tenant } = await requireTenantAccess();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const slug = slugify(name);
  await prisma.category.create({
    data: { tenantId: tenant.id, name, slug },
  });

  revalidatePath("/dashboard/categories");
}

export async function deleteCategory(id: string): Promise<void> {
  const { tenant } = await requireTenantAccess();
  await prisma.category.deleteMany({ where: { id, tenantId: tenant.id } });
  revalidatePath("/dashboard/categories");
}

export async function updateCategory(id: string, formData: FormData): Promise<void> {
  const { tenant } = await requireTenantAccess();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const slug = slugify(name);
  await prisma.category.updateMany({
    where: { id, tenantId: tenant.id },
    data: { name, slug },
  });

  revalidatePath("/dashboard/categories");
}

export async function createProduct(formData: FormData) {
  const { tenant } = await requireTenantAccess();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = parseFloat(String(formData.get("price") ?? "0"));
  const stock = parseInt(String(formData.get("stock") ?? "0"), 10);
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const imageUrls = formData.getAll("imageUrls").map(String).filter(Boolean);
  const featured = formData.get("featured") === "on";
  const isMegaOffer = formData.get("isMegaOffer") === "on";
  const freeShipping = formData.get("freeShipping") === "on";

  if (!name || !description || Number.isNaN(price)) return { error: "Campos obrigatórios ausentes." };

  const productCount = await prisma.product.count({ where: { tenantId: tenant.id } });
  const maxProducts = tenant.subscription?.plan.maxProducts ?? 50;

  if (productCount >= maxProducts) {
    const allPlans = await prisma.plan.findMany({ where: { active: true }, orderBy: { priceMonthly: "asc" } });
    const currentPlanIndex = allPlans.findIndex(p => p.id === tenant.subscription?.planId);
    
    if (currentPlanIndex === -1 || currentPlanIndex === allPlans.length - 1) {
       return { error: "MAX_PLATFORM_LIMIT_REACHED" };
    }
    const nextPlan = allPlans[currentPlanIndex + 1];
    return { error: "PLAN_LIMIT_REACHED", nextPlan };
  }

  await prisma.product.create({
    data: {
      tenantId: tenant.id,
      name,
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      description,
      price,
      stock,
      categoryId,
      imageUrls,
      featured,
      isMegaOffer,
      freeShipping,
      active: true,
    },
  });

  revalidatePath("/dashboard/products");
  revalidatePath(`/loja/${tenant.slug}`);
  
  return { success: true };
}

export async function updateProduct(formData: FormData) {
  const { tenant } = await requireTenantAccess();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = parseFloat(String(formData.get("price") ?? "0"));
  const stock = parseInt(String(formData.get("stock") ?? "0"), 10);
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const imageUrls = formData.getAll("imageUrls").map(String).filter(Boolean);
  const featured = formData.get("featured") === "on";
  const isMegaOffer = formData.get("isMegaOffer") === "on";
  const freeShipping = formData.get("freeShipping") === "on";

  if (!id || !name || !description || Number.isNaN(price)) return;

  // Verify ownership
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });
  
  if (!existingProduct || existingProduct.tenantId !== tenant.id) return;

  await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price,
      stock,
      categoryId,
      imageUrls,
      featured,
      isMegaOffer,
      freeShipping,
    },
  });

  revalidatePath("/dashboard/products");
  revalidatePath(`/loja/${tenant.slug}`);
}

export async function deleteProduct(id: string): Promise<void> {
  const { tenant } = await requireTenantAccess();
  await prisma.product.deleteMany({ where: { id, tenantId: tenant.id } });
  revalidatePath("/dashboard/products");
  revalidatePath(`/loja/${tenant.slug}`);
}

export async function updateStoreSettings(formData: FormData): Promise<void> {
  const { tenant } = await requireTenantAccess();

  const logoFile = formData.get("logo") as File | null;
  let logoUrl = tenant.logoUrl;

  if (logoFile && logoFile.size > 0) {
    const bytes = await logoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = logoFile.name.split('.').pop() || "png";
    const filename = `${tenant.id}-${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "logos");
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    const path = join(uploadDir, filename);
    await writeFile(path, buffer);
    
    logoUrl = `/uploads/logos/${filename}`;
  }

  const existingSettings = await prisma.storeSettings.findUnique({ where: { tenantId: tenant.id } });
  
  const banner1File = formData.get("banner1Image") as File | null;
  let banner1ImageUrl = existingSettings?.banner1ImageUrl;
  if (banner1File && banner1File.size > 0) {
    const bytes = await banner1File.arrayBuffer();
    const ext = banner1File.name.split('.').pop() || "png";
    const filename = `banner1-${tenant.id}-${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "banners");
    try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));
    banner1ImageUrl = `/uploads/banners/${filename}`;
  }

  const banner2File = formData.get("banner2Image") as File | null;
  let banner2ImageUrl = existingSettings?.banner2ImageUrl;
  if (banner2File && banner2File.size > 0) {
    const bytes = await banner2File.arrayBuffer();
    const ext = banner2File.name.split('.').pop() || "png";
    const filename = `banner2-${tenant.id}-${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "banners");
    try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));
    banner2ImageUrl = `/uploads/banners/${filename}`;
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      name: String(formData.get("name") ?? tenant.name),
      logoUrl: logoUrl,
      description: String(formData.get("description") ?? ""),
      primaryColor: String(formData.get("primaryColor") ?? tenant.primaryColor),
      secondaryColor: String(formData.get("secondaryColor") ?? tenant.secondaryColor),
      settings: {
        upsert: {
          create: {
            pixKey: String(formData.get("pixKey") ?? ""),
            mpAccessToken: String(formData.get("mpAccessToken") ?? ""),
            mpPublicKey: String(formData.get("mpPublicKey") ?? ""),
            contactEmail: String(formData.get("contactEmail") ?? ""),
            contactPhone: String(formData.get("contactPhone") ?? ""),
            document: String(formData.get("document") ?? ""),
            address: String(formData.get("address") ?? ""),
            freeShippingMinAmount: formData.get("freeShippingMinAmount") ? parseFloat(String(formData.get("freeShippingMinAmount"))) : null,
            banner1Tag: String(formData.get("banner1Tag") ?? "CUPONS"),
            banner1Title: String(formData.get("banner1Title") ?? "Frete Grátis"),
            banner1Subtitle: String(formData.get("banner1Subtitle") ?? "Confira condições"),
            banner1Color: String(formData.get("banner1Color") ?? "bg-gradient-to-br from-orange-500 to-red-500"),
            banner1Mode: String(formData.get("banner1Mode") ?? "DYNAMIC"),
            banner1ImageUrl: banner1ImageUrl,
            banner2Tag: String(formData.get("banner2Tag") ?? "NOVIDADE"),
            banner2Title: String(formData.get("banner2Title") ?? "Cashback"),
            banner2Subtitle: String(formData.get("banner2Subtitle") ?? "Em todas as compras"),
            banner2Color: String(formData.get("banner2Color") ?? "bg-slate-900"),
            banner2Mode: String(formData.get("banner2Mode") ?? "DYNAMIC"),
            banner2ImageUrl: banner2ImageUrl,
          },
          update: {
            pixKey: String(formData.get("pixKey") ?? ""),
            mpAccessToken: String(formData.get("mpAccessToken") ?? ""),
            mpPublicKey: String(formData.get("mpPublicKey") ?? ""),
            contactEmail: String(formData.get("contactEmail") ?? ""),
            contactPhone: String(formData.get("contactPhone") ?? ""),
            document: String(formData.get("document") ?? ""),
            address: String(formData.get("address") ?? ""),
            freeShippingMinAmount: formData.get("freeShippingMinAmount") ? parseFloat(String(formData.get("freeShippingMinAmount"))) : null,
            banner1Tag: String(formData.get("banner1Tag") ?? "CUPONS"),
            banner1Title: String(formData.get("banner1Title") ?? "Frete Grátis"),
            banner1Subtitle: String(formData.get("banner1Subtitle") ?? "Confira condições"),
            banner1Color: String(formData.get("banner1Color") ?? "bg-gradient-to-br from-orange-500 to-red-500"),
            banner1Mode: String(formData.get("banner1Mode") ?? "DYNAMIC"),
            banner1ImageUrl: banner1ImageUrl,
            banner2Tag: String(formData.get("banner2Tag") ?? "NOVIDADE"),
            banner2Title: String(formData.get("banner2Title") ?? "Cashback"),
            banner2Subtitle: String(formData.get("banner2Subtitle") ?? "Em todas as compras"),
            banner2Color: String(formData.get("banner2Color") ?? "bg-slate-900"),
            banner2Mode: String(formData.get("banner2Mode") ?? "DYNAMIC"),
            banner2ImageUrl: banner2ImageUrl,
          },
        },
      },
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/loja/${tenant.slug}`);
}

export async function aiGenerateDescription(formData: FormData) {
  const { tenant } = await requireTenantAccess();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const price = parseFloat(String(formData.get("price") ?? "0"));

  if (!name) return { error: "Informe o nome do produto." };

  const description = await generateProductDescription({
    name,
    category,
    price: Number.isNaN(price) ? undefined : price,
    storeName: tenant.name,
  });

  return { description };
}

export async function createOrder(formData: FormData, tenantSlug: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: { products: true },
  });
  if (!tenant) return { error: "Loja não encontrada." };

  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim().toLowerCase();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "PIX") as "PIX" | "CARD" | "BOLETO";
  
  // Endereço
  const shippingZipCode = String(formData.get("shippingZipCode") ?? "").trim();
  const shippingState = String(formData.get("shippingState") ?? "").trim();
  const shippingCity = String(formData.get("shippingCity") ?? "").trim();
  const shippingNeighborhood = String(formData.get("shippingNeighborhood") ?? "").trim();
  const shippingAddressStreet = String(formData.get("shippingAddress") ?? "").trim();
  const shippingComplement = String(formData.get("shippingComplement") ?? "").trim();

  const shippingAddress = [
    shippingAddressStreet,
    shippingComplement,
    shippingNeighborhood,
    `${shippingCity} - ${shippingState}`
  ].filter(Boolean).join(", ");

  const shippingCostRaw = formData.get("shippingCost");
  const shippingCost = shippingCostRaw ? parseFloat(String(shippingCostRaw)) : 0;

  const cartJson = String(formData.get("cart") ?? "[]");

  if (!customerName || !customerEmail) {
    return { error: "Nome e e-mail são obrigatórios." };
  }
  
  if (!shippingZipCode || !shippingAddressStreet) {
    return { error: "Endereço de entrega é obrigatório." };
  }

  let cart: { productId: string; quantity: number }[];
  try {
    cart = JSON.parse(cartJson);
  } catch {
    return { error: "Carrinho inválido." };
  }

  if (!cart.length) return { error: "Carrinho vazio." };

  const items = cart
    .map((item) => {
      const product = tenant.products.find((p) => p.id === item.productId && p.active);
      if (!product || product.stock < item.quantity) return null;
      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    })
    .filter(Boolean) as {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: typeof tenant.products[0]["price"];
  }[];

  if (!items.length) return { error: "Produtos indisponíveis no carrinho." };

  const total = items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  ) + shippingCost;

  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 10); // 10 dias de previsão

  const order = await prisma.$transaction(async (tx) => {
    let customer = await tx.customer.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: customerEmail } },
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          tenantId: tenant.id,
          name: customerName,
          email: customerEmail,
          phone: customerPhone || null,
        },
      });
    }

    const newOrder = await tx.order.create({
      data: {
        tenantId: tenant.id,
        customerId: customer.id,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        paymentMethod,
        shippingAddress,
        shippingZipCode,
        shippingCost,
        estimatedDelivery: estimatedDeliveryDate,
        total,
        status: "PENDING",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  return { success: true, orderId: order.id };
}

export async function updateOrderShipping(formData: FormData) {
  const { tenant } = await requireTenantAccess();
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "PENDING") as any;
  const trackingCode = String(formData.get("trackingCode") ?? "").trim();
  const estimatedDeliveryRaw = String(formData.get("estimatedDelivery") ?? "");
  
  if (!orderId) return { error: "ID do pedido obrigatório" };

  await prisma.order.update({
    where: { id: orderId, tenantId: tenant.id },
    data: {
      status,
      trackingCode: trackingCode || null,
      estimatedDelivery: estimatedDeliveryRaw ? new Date(estimatedDeliveryRaw) : null,
    },
  });

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
  return { success: true };
}

export async function upgradeSubscription(newPlanId: string) {
  const { tenant } = await requireTenantAccess();

  const plan = await prisma.plan.findUnique({ where: { id: newPlanId } });
  if (!plan) return { error: "Plano não encontrado." };

  await prisma.$transaction(async (tx) => {
    // Atualizar assinatura da loja
    await tx.subscription.update({
      where: { tenantId: tenant.id },
      data: { planId: plan.id },
    });

    // Criar notificação para os SuperAdmins
    await tx.platformNotification.create({
      data: {
        tenantId: tenant.id,
        message: `A loja **${tenant.name}** fez upgrade automático para o plano **${plan.name}** após atingir o limite de produtos.`,
      },
    });
  });

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/subscription");
  revalidatePath("/admin");
  return { success: true };
}
