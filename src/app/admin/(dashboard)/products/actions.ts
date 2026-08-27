"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { ProductCategory, Size } from "@prisma/client";

async function deleteBlobsQuietly(urls: string[]) {
  await Promise.allSettled(
    urls
      .filter((url) => url.includes(".blob.vercel-storage.com"))
      .map((url) => del(url))
  );
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseCategory(value: FormDataEntryValue | null): ProductCategory {
  const category = String(value ?? "");
  if (!Object.values(ProductCategory).includes(category as ProductCategory)) {
    throw new Error("Please choose a valid category.");
  }
  return category as ProductCategory;
}

function parseSize(value: FormDataEntryValue | null): Size {
  const size = String(value ?? "");
  if (!Object.values(Size).includes(size as Size)) {
    throw new Error("Please choose a valid size.");
  }
  return size as Size;
}

function parsePriceCents(value: FormDataEntryValue | null): number {
  const dollars = Number(value ?? 0);
  if (!Number.isFinite(dollars) || dollars < 0) {
    throw new Error("Price must be a positive number.");
  }
  return Math.round(dollars * 100);
}

function parseStock(value: FormDataEntryValue | null): number {
  const stock = Number(value ?? 0);
  if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
    throw new Error("Stock must be a whole number of 0 or more.");
  }
  return stock;
}

function revalidateStorefront(productId: string) {
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = parseCategory(formData.get("category"));

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
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = parseCategory(formData.get("category"));
  const active = formData.get("active") === "on";
  const badge = String(formData.get("badge") ?? "").trim();

  await prisma.product.update({
    where: { id },
    data: { name, description, category, active, badge: badge || null },
  });

  revalidateStorefront(id);
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  await prisma.product.delete({ where: { id } });
  await deleteBlobsQuietly(product.images);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function addImage(id: string, url: string) {
  await requireAdmin();

  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  const images = [...product.images, url];

  await prisma.product.update({
    where: { id },
    data: {
      images,
      coverImageUrl: product.coverImageUrl ?? url,
    },
  });

  revalidateStorefront(id);
}

export async function removeImage(id: string, url: string) {
  await requireAdmin();

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
  await deleteBlobsQuietly([url]);

  revalidateStorefront(id);
}

export async function setCoverImage(id: string, url: string) {
  await requireAdmin();

  await prisma.product.update({ where: { id }, data: { coverImageUrl: url } });
  revalidateStorefront(id);
}

export async function addVariant(productId: string, formData: FormData) {
  await requireAdmin();

  const size = parseSize(formData.get("size"));
  const sku = String(formData.get("sku") ?? "").trim();
  const priceCents = parsePriceCents(formData.get("price"));
  const stock = parseStock(formData.get("stock"));

  if (!sku) throw new Error("SKU is required");

  const [existingSku, existingSize] = await Promise.all([
    prisma.variant.findUnique({ where: { sku } }),
    prisma.variant.findUnique({ where: { productId_size: { productId, size } } }),
  ]);
  if (existingSku) throw new Error(`SKU "${sku}" is already in use.`);
  if (existingSize) throw new Error(`This product already has a size ${size} variant.`);

  await prisma.variant.create({
    data: { productId, size, sku, priceCents, stock },
  });

  revalidateStorefront(productId);
}

export async function updateVariant(
  variantId: string,
  productId: string,
  formData: FormData
) {
  await requireAdmin();

  const priceCents = parsePriceCents(formData.get("price"));
  const stock = parseStock(formData.get("stock"));
  const active = formData.get("active") === "on";

  await prisma.variant.update({
    where: { id: variantId },
    data: { priceCents, stock, active },
  });

  revalidateStorefront(productId);
}

export async function deleteVariant(variantId: string, productId: string) {
  await requireAdmin();

  await prisma.variant.delete({ where: { id: variantId } });
  revalidateStorefront(productId);
}
