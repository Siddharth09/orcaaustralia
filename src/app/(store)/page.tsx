import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getActiveProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getActiveProducts();

  return (
    <div>
      <section className="relative flex h-[70vh] min-h-[480px] items-center justify-center overflow-hidden">
        <Image
          src="/placeholders/hero.svg"
          alt="Orca Australia"
          fill
          priority
          className="object-cover"
        />
        <div className="relative z-10 text-center text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-white/80">
            New Season
          </p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
            Built for the water
          </h1>
          <p className="mx-auto mt-4 max-w-md text-white/80">
            Men&apos;s swim shorts and Tencel modal boxer briefs, made for
            Australian summers.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Shop All Products
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/products?category=SHORTS"
            className="group relative flex h-64 items-end overflow-hidden rounded-lg bg-navy p-6"
          >
            <Image
              src="/placeholders/swim-shorts.svg"
              alt="Swim Shorts"
              fill
              loading="eager"
              className="object-cover opacity-70 transition group-hover:opacity-90"
            />
            <span className="relative text-lg font-semibold text-white">
              Swim Shorts
            </span>
          </Link>
          <Link
            href="/products?category=BOXER_BRIEF"
            className="group relative flex h-64 items-end overflow-hidden rounded-lg bg-navy p-6"
          >
            <Image
              src="/placeholders/boxer-briefs.svg"
              alt="Tencel Modal Boxer Briefs"
              fill
              className="object-cover opacity-70 transition group-hover:opacity-90"
            />
            <span className="relative text-lg font-semibold text-white">
              Tencel Modal Boxer Briefs
            </span>
          </Link>
        </div>
      </section>

      {products.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <h2 className="text-xl font-semibold text-navy">Featured</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
