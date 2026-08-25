import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";

export default async function AdminOverviewPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [ordersToday, revenueToday, recentOrders, lowStock] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
    prisma.variant.findMany({
      where: { active: true, stock: { lte: 3 } },
      include: { product: true },
      take: 5,
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">Overview</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-black/10 bg-white p-6">
          <p className="text-sm text-navy/60">Orders today</p>
          <p className="mt-2 text-3xl font-semibold text-navy">{ordersToday}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-6">
          <p className="text-sm text-navy/60">Revenue today</p>
          <p className="mt-2 text-3xl font-semibold text-navy">
            {formatCents(revenueToday._sum.totalCents ?? 0)}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-navy">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-navy/60 underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {recentOrders.length === 0 && (
              <p className="text-sm text-navy/50">No orders yet.</p>
            )}
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded border border-black/10 bg-white px-4 py-3 text-sm hover:border-navy/30"
                >
                  <span className="text-navy">
                    #{order.id.slice(-8).toUpperCase()} — {order.customerEmail}
                  </span>
                  <span className="font-medium text-navy">
                    {formatCents(order.totalCents)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-medium text-navy">Low Stock</h2>
          <ul className="mt-4 space-y-2">
            {lowStock.length === 0 && (
              <p className="text-sm text-navy/50">Nothing running low.</p>
            )}
            {lowStock.map((variant) => (
              <li
                key={variant.id}
                className="flex items-center justify-between rounded border border-black/10 bg-white px-4 py-3 text-sm"
              >
                <span className="text-navy">
                  {variant.product.name} — {variant.size}
                </span>
                <span className="font-medium text-accent">{variant.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
