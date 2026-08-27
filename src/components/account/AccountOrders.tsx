"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCents } from "@/lib/money";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus, RefundStatus } from "@prisma/client";

interface AccountItem {
  id: string;
  productName: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
  refundStatus: RefundStatus | null;
}

interface AccountOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
  trackingUrl: string | null;
  items: AccountItem[];
}

const REFUND_BADGE_LABEL: Record<RefundStatus, string> = {
  REQUESTED: "Refund Requested",
  APPROVED: "Refund Approved",
  DENIED: "Refund Denied",
};

function RefundAction({
  orderId,
  item,
  eligible,
}: {
  orderId: string;
  item: AccountItem;
  eligible: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (item.refundStatus && item.refundStatus !== "DENIED") {
    return (
      <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-navy">
        {REFUND_BADGE_LABEL[item.refundStatus]}
      </span>
    );
  }

  if (done) {
    return (
      <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-navy">
        Refund Requested
      </span>
    );
  }

  if (!eligible) return null;

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/refund-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderItemId: item.id, reason }),
      });
      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // no JSON body
      }
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-navy underline hover:text-navy-dark"
      >
        {item.refundStatus === "DENIED" ? "Request Again" : "Request Refund"}
      </button>
    );
  }

  return (
    <div className="mt-2 w-full sm:w-64">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Why are you requesting a refund?"
        rows={2}
        className="w-full rounded border border-black/20 px-2 py-1.5 text-xs"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <div className="mt-1 flex gap-2">
        <button
          onClick={submit}
          disabled={loading || !reason.trim()}
          className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Sending..." : "Submit"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-navy/50 underline hover:text-navy"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function AccountOrders({
  email,
  orders,
}: {
  email: string;
  orders: AccountOrder[];
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy">My Account</h1>
          <p className="mt-1 text-sm text-navy/60">Signed in as {email}</p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="text-sm text-navy/60 underline hover:text-navy"
        >
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-navy/60">
          No orders yet — once you place one, it&apos;ll show up here.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const eligible = order.status === "PAID" || order.status === "FULFILLED";
            return (
              <div key={order.id} className="rounded-lg border border-black/10 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
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

                <ul className="mt-4 divide-y divide-black/5">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-start justify-between gap-2 py-3"
                    >
                      <div>
                        <p className="text-sm text-navy">{item.productName}</p>
                        <p className="text-xs text-navy/60">
                          Size {item.size} &times; {item.quantity} &middot;{" "}
                          {formatCents(item.unitPriceCents * item.quantity)}
                        </p>
                      </div>
                      <RefundAction orderId={order.id} item={item} eligible={eligible} />
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
                  <span className="font-medium text-navy">
                    {formatCents(order.totalCents)}
                  </span>
                  <div className="flex gap-4">
                    {order.trackingUrl && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-navy underline hover:text-navy-dark"
                      >
                        Track Package
                      </a>
                    )}
                    <a
                      href={`/contact?order=${order.orderNumber}`}
                      className="text-xs text-navy/60 underline hover:text-navy"
                    >
                      Need help?
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
