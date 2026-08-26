"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatCents } from "@/lib/money";
import { startCheckout } from "@/lib/checkoutClient";

export default function CartPage() {
  const { items, removeItem, setQuantity, subtotalCents } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      await startCheckout(
        items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-navy">Your cart is empty</h1>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-navy px-8 py-3 text-sm font-semibold text-white"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-navy">Your Cart</h1>
      <ul className="mt-8 divide-y divide-black/10">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4 py-4">
            <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded bg-sand">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-navy">{item.productName}</p>
              <p className="text-sm text-navy/60">Size {item.size}</p>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  aria-label={`Quantity for ${item.productName}, size ${item.size}`}
                  value={item.quantity}
                  onChange={(e) =>
                    setQuantity(item.variantId, Number(e.target.value))
                  }
                  className="w-16 rounded border border-black/20 px-2 py-1 text-sm"
                />
                <button
                  onClick={() => removeItem(item.variantId)}
                  className="text-xs text-navy/50 underline hover:text-navy"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="font-medium text-navy">
              {formatCents(item.unitPriceCents * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-between text-lg font-medium text-navy">
        <span>Subtotal</span>
        <span>{formatCents(subtotalCents)}</span>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-6 w-full rounded-full bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-50 sm:w-auto sm:px-12"
      >
        {loading ? "Redirecting..." : "Checkout"}
      </button>
    </div>
  );
}
