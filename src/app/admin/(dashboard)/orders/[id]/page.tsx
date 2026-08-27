import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { getResend } from "@/lib/resend";
import { renderShippingNotificationEmail } from "@/lib/orderEmail";
import type { OrderStatus } from "@prisma/client";

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "PAID", "FULFILLED", "CANCELLED"];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  async function updateStatus(formData: FormData) {
    "use server";
    const status = String(formData.get("status")) as OrderStatus;
    const wasFulfilled = order!.status === "FULFILLED";

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    if (status === "FULFILLED" && !wasFulfilled && updated.customerEmail) {
      try {
        const variantIds = order!.items
          .map((item) => item.variantId)
          .filter((vid): vid is string => Boolean(vid));
        const variants = await prisma.variant.findMany({
          where: { id: { in: variantIds } },
          include: { product: { select: { coverImageUrl: true } } },
        });
        const imageByVariantId = new Map(
          variants.map((v) => [v.id, v.product.coverImageUrl])
        );

        const { error } = await getResend().emails.send({
          from: process.env.ORDER_EMAIL_FROM ?? "orders@orcaaustralia.com",
          to: updated.customerEmail,
          subject: "Your Orca Australia order has shipped",
          html: renderShippingNotificationEmail({
            ...updated,
            items: order!.items.map((item) => ({
              ...item,
              imageUrl: item.variantId
                ? imageByVariantId.get(item.variantId)
                : null,
            })),
          }),
        });
        if (error) throw error;
      } catch (err) {
        console.error("Shipping notification email failed to send:", err);
      }
    }

    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
  }

  const shipping = order.shippingAddress as {
    address?: { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string };
    name?: string;
  } | null;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">
        Order #{order.id.slice(-8).toUpperCase()}
      </h1>
      <p className="mt-1 text-sm text-navy/60">
        Placed {order.createdAt.toLocaleString("en-AU")}
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-black/10 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-black/10 bg-sand text-left text-navy/60">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-black/5 last:border-0">
                    <td className="px-4 py-3 text-navy">{item.productName}</td>
                    <td className="px-4 py-3 text-navy/80">{item.size}</td>
                    <td className="px-4 py-3 text-navy/80">{item.quantity}</td>
                    <td className="px-4 py-3 text-navy">
                      {formatCents(item.unitPriceCents * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between border-t border-black/10 px-4 py-3 font-medium text-navy">
              <span>Total</span>
              <span>{formatCents(order.totalCents)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-black/10 bg-white p-5">
            <h2 className="text-sm font-semibold text-navy">Customer</h2>
            <p className="mt-2 text-sm text-navy/80">{order.customerName}</p>
            <p className="text-sm text-navy/80">{order.customerEmail}</p>
          </div>

          {shipping?.address && (
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <h2 className="text-sm font-semibold text-navy">Shipping Address</h2>
              <p className="mt-2 text-sm text-navy/80">{shipping.name}</p>
              <p className="text-sm text-navy/80">{shipping.address.line1}</p>
              {shipping.address.line2 && (
                <p className="text-sm text-navy/80">{shipping.address.line2}</p>
              )}
              <p className="text-sm text-navy/80">
                {shipping.address.city} {shipping.address.state}{" "}
                {shipping.address.postal_code}
              </p>
              <p className="text-sm text-navy/80">{shipping.address.country}</p>
            </div>
          )}

          <form action={updateStatus} className="rounded-lg border border-black/10 bg-white p-5">
            <h2 className="text-sm font-semibold text-navy">Status</h2>
            <select
              name="status"
              defaultValue={order.status}
              className="mt-2 w-full rounded border border-black/20 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="mt-3 w-full rounded-full bg-navy py-2 text-sm font-semibold text-white hover:bg-navy-dark"
            >
              Update
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
