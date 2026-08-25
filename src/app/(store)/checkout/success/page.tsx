"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function CheckoutSuccessPage() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-navy">Thank you!</h1>
      <p className="mt-4 text-navy/70">
        Your order has been placed. A confirmation email is on its way.
      </p>
      <Link
        href="/products"
        className="mt-8 inline-block rounded-full bg-navy px-8 py-3 text-sm font-semibold text-white"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
