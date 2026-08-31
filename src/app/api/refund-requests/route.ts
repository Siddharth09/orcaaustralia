import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customerSession";
import { getResend } from "@/lib/resend";
import { renderRefundRequestedAdminEmail } from "@/lib/orderEmail";

const bodySchema = z.object({
  orderId: z.string().min(1),
  orderItemId: z.string().min(1),
  reason: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request) {
  const session = await getCustomerSession();
  if (!session.email) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a reason for the refund." }, { status: 400 });
  }

  const { orderId, orderItemId, reason } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.customerEmail.toLowerCase() !== session.email.toLowerCase()) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status !== "PAID" && order.status !== "FULFILLED") {
    return NextResponse.json(
      { error: "This order isn't eligible for a refund request." },
      { status: 400 }
    );
  }

  const item = order.items.find((i) => i.id === orderItemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found on this order." }, { status: 404 });
  }

  const existing = await prisma.refundRequest.findFirst({
    where: { orderItemId: item.id, status: { in: ["REQUESTED", "APPROVED"] } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A refund has already been requested for this item." },
      { status: 400 }
    );
  }

  const refundRequest = await prisma.refundRequest.create({
    data: {
      orderId: order.id,
      orderItemId: item.id,
      reason,
      amountCents: item.unitPriceCents * item.quantity,
    },
  });

  try {
    const { error } = await getResend().emails.send({
      from: process.env.ORDER_EMAIL_FROM ?? "orders@orcaaustralia.com",
      to: "support@astryks.com",
      replyTo: order.customerEmail,
      subject: `New refund request — Order #${order.id.slice(-8).toUpperCase()}`,
      html: renderRefundRequestedAdminEmail({
        orderId: order.id,
        productName: item.productName,
        size: item.size,
        amountCents: refundRequest.amountCents,
        reason,
        customerEmail: order.customerEmail,
      }),
    });
    if (error) throw error;
  } catch (err) {
    // The request is already saved; the admin will still see it in the dashboard.
    console.error("Refund request admin notification failed to send:", err);
  }

  return NextResponse.json({ success: true });
}
