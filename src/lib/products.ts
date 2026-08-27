import { prisma } from "@/lib/prisma";
import { SIZE_ORDER } from "@/lib/constants";
import type { ProductCategory } from "@prisma/client";

export async function getActiveProducts(category?: ProductCategory) {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
    },
    include: { variants: { where: { active: true } } },
    orderBy: { createdAt: "asc" },
  });

  return products
    .filter((product) => product.variants.length > 0)
    .map((product) => ({
      slug: product.slug,
      name: product.name,
      category: product.category,
      badge: product.badge,
      coverImageUrl: product.coverImageUrl,
      fromPriceCents: Math.min(...product.variants.map((v) => v.priceCents)),
    }));
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: { where: { active: true } } },
  });

  if (!product) return null;

  return {
    ...product,
    variants: [...product.variants].sort(
      (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
    ),
  };
}
