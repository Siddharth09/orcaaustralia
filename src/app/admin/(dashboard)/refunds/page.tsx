import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { RefundRequestActions } from "@/components/admin/RefundRequestActions";
import type { RefundStatus } from "@prisma/client";

const STATUS_OPTIONS: RefundStatus[] = ["REQUESTED", "APPROVED", "DENIED"];

export default async function AdminRefundsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatus = STATUS_OPTIONS.includes(status as RefundStatus)
    ? (status as RefundStatus)
    : undefined;

  const refundRequests = await prisma.refundRequest.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    include: { order: true, orderItem: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">Refund Requests</h1>

      <div className="mt-4 flex gap-2 text-sm">
        <Link
          href="/admin/refunds"
          className={`rounded-full px-3 py-1 ${
            !validStatus ? "bg-navy text-white" : "bg-white text-navy border border-black/10"
          }`}
        >
          All
        </Link>
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/refunds?status=${s}`}
            className={`rounded-full px-3 py-1 ${
              validStatus === s ? "bg-navy text-white" : "bg-white text-navy border border-black/10"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {refundRequests.length === 0 && (
          <p className="text-sm text-navy/50">No refund requests found.</p>
        )}
        {refundRequests.map((rr) => {
          return (
            <div key={rr.id} className="rounded-lg border border-black/10 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/admin/orders/${rr.orderId}`}
                  className="font-medium text-navy underline"
                >
                  Order #{rr.orderId.slice(-8).toUpperCase()}
                </Link>
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-navy">
                  {rr.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-navy/80">
                {rr.orderItem?.productName ?? "Item removed"}
                {rr.orderItem ? ` (${rr.orderItem.size})` : ""} &middot;{" "}
                {formatCents(rr.amountCents)}
              </p>
              <p className="mt-1 text-sm text-navy/60">Customer: {rr.order.customerEmail}</p>
              <p className="mt-2 rounded bg-sand px-3 py-2 text-sm text-navy/80">
                &ldquo;{rr.reason}&rdquo;
              </p>
              {rr.adminNote && (
                <p className="mt-2 text-xs text-navy/50">Your note: {rr.adminNote}</p>
              )}
              {rr.stripeRefundId && (
                <p className="mt-2 text-xs text-navy/50">Stripe refund: {rr.stripeRefundId}</p>
              )}

              {rr.status === "REQUESTED" && <RefundRequestActions id={rr.id} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
