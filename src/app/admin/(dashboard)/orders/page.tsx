import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import type { OrderStatus } from "@prisma/client";

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "PAID", "FULFILLED", "CANCELLED"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatus = STATUS_OPTIONS.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;

  const ORDER_LIMIT = 200;
  const orders = await prisma.order.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: ORDER_LIMIT,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">Orders</h1>
      {orders.length === ORDER_LIMIT && (
        <p className="mt-2 text-xs text-navy/50">
          Showing the most recent {ORDER_LIMIT} orders. Filter by status to narrow results.
        </p>
      )}

      <div className="mt-4 flex gap-2 text-sm">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1 ${
            !validStatus ? "bg-navy text-white" : "bg-white text-navy border border-black/10"
          }`}
        >
          All
        </Link>
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1 ${
              validStatus === s ? "bg-navy text-white" : "bg-white text-navy border border-black/10"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-black/10 bg-sand text-left text-navy/60">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium text-navy underline"
                  >
                    #{order.id.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3 text-navy/80">{order.customerEmail}</td>
                <td className="px-4 py-3 text-navy/80">
                  {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                </td>
                <td className="px-4 py-3 font-medium text-navy">
                  {formatCents(order.totalCents)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-sand px-2 py-1 text-xs font-medium text-navy">
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-navy/60">
                  {order.createdAt.toLocaleDateString("en-AU")}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy/50">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
