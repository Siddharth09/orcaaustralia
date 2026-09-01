import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/products";
import { CATEGORY_LABELS } from "@/lib/constants";
import { AddToCartForm } from "@/components/AddToCartForm";
import { ProductGallery } from "@/components/ProductGallery";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.coverImageUrl ? [product.coverImageUrl] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.active) notFound();

  const galleryImages =
    product.images.length > 0
      ? product.images
      : product.coverImageUrl
        ? [product.coverImageUrl]
        : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={galleryImages} productName={product.name} />

        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-wide text-navy/50">
              {CATEGORY_LABELS[product.category]}
            </p>
            {product.badge && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                {product.badge}
              </span>
            )}
          </div>
          <h1 className="mt-1 text-3xl font-semibold text-navy">
            {product.name}
          </h1>
          <p className="mt-4 whitespace-pre-line text-navy/70">
            {product.description}
          </p>

          <div className="mt-6">
            <AddToCartForm
              productSlug={product.slug}
              productName={product.name}
              image={galleryImages[0] ?? null}
              variants={product.variants.map((v) => ({
                id: v.id,
                size: v.size,
                sku: v.sku,
                priceCents: v.priceCents,
                stock: v.stock,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
