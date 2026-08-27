import { getCustomerSession } from "@/lib/customerSession";
import { prisma } from "@/lib/prisma";
import { LoginForm } from "@/components/account/LoginForm";
import { AccountOrders } from "@/components/account/AccountOrders";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getCustomerSession();
  const { error } = await searchParams;

  if (!session.email) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-semibold text-navy">My Account</h1>
        <p className="mt-2 text-sm text-navy/60">
          Sign in with your email to see your order history and request
          refunds. No password needed — we&apos;ll email you a sign-in link.
        </p>
        <LoginForm />
        {error === "invalid_link" && (
          <p className="mt-4 text-sm text-red-600">
            That sign-in link has expired or already been used. Please request a new one.
          </p>
        )}
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { customerEmail: { equals: session.email, mode: "insensitive" } },
    include: { items: { include: { refundRequests: true } } },
    orderBy: { createdAt: "desc" },
  });

  const serializedOrders = orders.map((order) => ({
    id: order.id,
    orderNumber: order.id.slice(-8).toUpperCase(),
    status: order.status,
    totalCents: order.totalCents,
    createdAt: order.createdAt.toISOString(),
    trackingUrl: order.trackingUrl,
    items: order.items.map((item) => {
      const latestRefund = [...item.refundRequests].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];
      return {
        id: item.id,
        productName: item.productName,
        size: item.size,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        refundStatus: latestRefund?.status ?? null,
      };
    }),
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <AccountOrders email={session.email} orders={serializedOrders} />
    </div>
  );
}
