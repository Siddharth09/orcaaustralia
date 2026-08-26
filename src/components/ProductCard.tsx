import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatCents } from "@/lib/money";
import type { ProductCategory } from "@prisma/client";

export interface ProductCardData {
  slug: string;
  name: string;
  category: ProductCategory;
  badge?: string | null;
  coverImageUrl: string | null;
  fromPriceCents: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-black/5 bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand">
        {product.coverImageUrl && (
          <Image
            src={product.coverImageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-navy/50">
          {CATEGORY_LABELS[product.category]}
        </p>
        <h3 className="mt-1 font-medium text-navy">{product.name}</h3>
        <p className="mt-1 text-sm text-navy/70">
          From {formatCents(product.fromPriceCents)}
        </p>
      </div>
    </Link>
  );
}
