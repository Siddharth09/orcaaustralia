"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function SiteHeader() {
  const { totalQuantity, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold tracking-tight text-navy"
        >
          <Image src="/orca-icon-navy.png" alt="" width={28} height={28} />
          ORCA <span className="font-light">AUSTRALIA</span>
        </Link>
        <nav className="hidden gap-8 text-sm font-medium text-navy/80 sm:flex">
          <Link href="/products" className="hover:text-navy">
            All Products
          </Link>
          <Link href="/products?category=SHORTS" className="hover:text-navy">
            Swim Shorts
          </Link>
          <Link href="/products?category=BOXER_BRIEF" className="hover:text-navy">
            Boxer Briefs
          </Link>
        </nav>
        <button
          onClick={openCart}
          className="relative rounded-full border border-navy/20 px-4 py-2 text-sm font-medium text-navy transition hover:bg-navy hover:text-white"
        >
          Cart
          {totalQuantity > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
              {totalQuantity}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
