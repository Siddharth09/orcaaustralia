"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatCents } from "@/lib/money";
import { startCheckout } from "@/lib/checkoutClient";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQuantity, subtotalCents } =
    useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close cart"
        className="absolute inset-0 bg-black/40"
        onClick={closeCart}
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-navy">Your Cart</h2>
          <button onClick={closeCart} className="text-2xl leading-none text-navy/60">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-navy/60">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4">
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded bg-sand">
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
                    <p className="text-sm font-medium text-navy">
                      {item.productName}
                    </p>
                    <p className="text-xs text-navy/60">Size {item.size}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          setQuantity(item.variantId, Number(e.target.value))
                        }
                        className="w-14 rounded border border-black/20 px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs text-navy/50 underline hover:text-navy"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-navy">
                    {formatCents(item.unitPriceCents * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-black/10 px-6 py-4">
          <div className="flex justify-between text-sm font-medium text-navy">
            <span>Subtotal</span>
            <span>{formatCents(subtotalCents)}</span>
          </div>
          <p className="mt-1 text-xs text-navy/50">
            Shipping and taxes calculated at checkout.
          </p>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <button
            onClick={handleCheckout}
            disabled={items.length === 0 || loading}
            className="mt-4 w-full rounded-full bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-50"
          >
            {loading ? "Redirecting..." : "Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
