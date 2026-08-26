import { ProductCard } from "@/components/ProductCard";
import { getActiveProducts } from "@/lib/products";
import { CATEGORY_LABELS } from "@/lib/constants";
import { TencelModalExplainer } from "@/components/TencelModalExplainer";
import type { ProductCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES: ProductCategory[] = ["SHORTS", "GYM_SHORTS", "BOXER_BRIEF"];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const validCategory = VALID_CATEGORIES.includes(category as ProductCategory)
    ? (category as ProductCategory)
    : undefined;

  const products = await getActiveProducts(validCategory);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-navy">
        {validCategory ? CATEGORY_LABELS[validCategory] : "All Products"}
      </h1>

      {products.length === 0 ? (
        <p className="mt-8 text-sm text-navy/60">
          No products yet — check back soon.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}

      {validCategory === "BOXER_BRIEF" && <TencelModalExplainer />}
    </div>
  );
}
