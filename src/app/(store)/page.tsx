import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getActiveProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const BLOB = "https://tyypnlpqlv0ylyem.public.blob.vercel-storage.com/products";

export default async function HomePage() {
  const products = await getActiveProducts();

  return (
    <div>
      <section className="relative flex h-[75vh] min-h-[560px] items-center justify-center overflow-hidden">
        <Image
          src={`${BLOB}/cover.jpg`}
          alt="Orca Australia"
          fill
          priority
          className="object-cover object-[50%_18%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy-dark/30 to-navy-dark/50" />
        <div className="relative z-10 text-center text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-white/80">
            New Season
          </p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
            Built for the water
          </h1>
          <p className="mx-auto mt-4 max-w-md text-white/80">
            Men&apos;s swim shorts, gym shorts, and Tencel modal boxer briefs,
            made for Australian summers.
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
        <div className="grid gap-6 sm:grid-cols-3">
          <Link
            href="/products?category=SHORTS"
            className="group relative flex h-64 items-end overflow-hidden rounded-lg bg-navy p-6"
          >
            <Image
              src={`${BLOB}/highseas-shorts-4-model.jpg`}
              alt="Swim Shorts"
              fill
              loading="eager"
              className="object-cover opacity-90 transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy-dark/10 to-transparent" />
            <span className="relative text-lg font-semibold text-white">
              Swim Shorts
            </span>
          </Link>
          <Link
            href="/products?category=GYM_SHORTS"
            className="group relative flex h-64 items-end overflow-hidden rounded-lg bg-navy p-6"
          >
            <Image
              src={`${BLOB}/blue-shorts-4-model.jpg`}
              alt="Gym Shorts"
              fill
              className="object-cover opacity-90 transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy-dark/10 to-transparent" />
            <span className="relative text-lg font-semibold text-white">
              Gym Shorts
            </span>
          </Link>
          <Link
            href="/products?category=BOXER_BRIEF"
            className="group relative flex h-64 items-end overflow-hidden rounded-lg bg-navy p-6"
          >
            <Image
              src={`${BLOB}/briefs-4-model.jpg`}
              alt="Tencel Modal Boxer Briefs"
              fill
              className="object-cover opacity-90 transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy-dark/10 to-transparent" />
            <span className="relative text-lg font-semibold text-white">
              Tencel Modal Boxer Briefs
            </span>
          </Link>
        </div>
      </section>

      <section className="border-y border-black/5 bg-sand">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-8 text-center sm:grid-cols-4">
          {[
            { label: "Quick-dry fabric" },
            { label: "Ultra-soft Tencel modal" },
            { label: "Designed for Aussie summers" },
            { label: "Secure checkout via Stripe" },
          ].map((item) => (
            <div key={item.label} className="text-xs font-medium uppercase tracking-wide text-navy/60 sm:text-sm">
              {item.label}
            </div>
          ))}
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
