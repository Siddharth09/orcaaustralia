"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ProductCategory, Size } from "@prisma/client";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category")) as ProductCategory;

  if (!name) throw new Error("Name is required");

  const baseSlug = slugify(name) || "product";
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.product.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  const product = await prisma.product.create({
    data: { name, slug, description, category },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category")) as ProductCategory;
  const active = formData.get("active") === "on";
  const badge = String(formData.get("badge") ?? "").trim();

  await prisma.product.update({
    where: { id },
    data: { name, description, category, active, badge: badge || null },
  });

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function addImage(id: string, url: string) {
  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  const images = [...product.images, url];

  await prisma.product.update({
    where: { id },
    data: {
      images,
      coverImageUrl: product.coverImageUrl ?? url,
    },
  });

  revalidatePath(`/admin/products/${id}`);
}

export async function removeImage(id: string, url: string) {
  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  const images = product.images.filter((img) => img !== url);

  await prisma.product.update({
    where: { id },
    data: {
      images,
      coverImageUrl:
        product.coverImageUrl === url ? (images[0] ?? null) : product.coverImageUrl,
    },
  });

  revalidatePath(`/admin/products/${id}`);
}

export async function setCoverImage(id: string, url: string) {
  await prisma.product.update({ where: { id }, data: { coverImageUrl: url } });
  revalidatePath(`/admin/products/${id}`);
}

export async function addVariant(productId: string, formData: FormData) {
  const size = String(formData.get("size")) as Size;
  const sku = String(formData.get("sku") ?? "").trim();
  const priceDollars = Number(formData.get("price") ?? 0);
  const stock = Number(formData.get("stock") ?? 0);

  if (!sku) throw new Error("SKU is required");

  await prisma.variant.create({
    data: {
      productId,
      size,
      sku,
      priceCents: Math.round(priceDollars * 100),
      stock,
    },
  });

  revalidatePath(`/admin/products/${productId}`);
}

export async function updateVariant(
  variantId: string,
  productId: string,
  formData: FormData
) {
  const priceDollars = Number(formData.get("price") ?? 0);
  const stock = Number(formData.get("stock") ?? 0);
  const active = formData.get("active") === "on";

  await prisma.variant.update({
    where: { id: variantId },
    data: { priceCents: Math.round(priceDollars * 100), stock, active },
  });

  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariant(variantId: string, productId: string) {
  await prisma.variant.delete({ where: { id: variantId } });
  revalidatePath(`/admin/products/${productId}`);
}
