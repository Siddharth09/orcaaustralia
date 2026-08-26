"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCents } from "@/lib/money";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@prisma/client";

interface LookupOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
  items: { productName: string; size: string; quantity: number; unitPriceCents: number }[];
}

export default function TrackOrderPage() {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<LookupOrder[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrders(null);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orderNumber }),
      });
      let data: { orders?: LookupOrder[]; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // no JSON body
      }
      if (!res.ok || !data.orders) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setOrders(data.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-navy">Track Your Order</h1>
      <p className="mt-2 text-sm text-navy/60">
        Enter the email you ordered with and your order number (from your
        confirmation email, e.g. <span className="font-medium">#A1B2C3D4</span>) to
        see your order status and history.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-black/10 bg-white p-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="orderNumber" className="block text-sm font-medium text-navy">
            Order Number
          </label>
          <input
            id="orderNumber"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="A1B2C3D4"
            className="mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm uppercase"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-50"
        >
          {loading ? "Looking up..." : "Track Order"}
        </button>
      </form>

      {orders && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-medium text-navy">
            {orders.length === 1 ? "Your order" : `Your orders (${orders.length})`}
          </h2>
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-black/10 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium text-navy">#{order.orderNumber}</p>
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-navy">
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <p className="mt-1 text-xs text-navy/50">
                {new Date(order.createdAt).toLocaleDateString("en-AU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-navy/80">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.productName} ({item.size}) &times; {item.quantity}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
                <span className="font-medium text-navy">
                  {formatCents(order.totalCents)}
                </span>
                <Link
                  href={`/contact?order=${order.orderNumber}`}
                  className="text-xs text-navy/60 underline hover:text-navy"
                >
                  Need help with this order?
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
