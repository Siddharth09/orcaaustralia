"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getResend } from "@/lib/resend";
import { requireAdmin } from "@/lib/session";
import { renderRefundApprovedEmail, renderRefundDeniedEmail } from "@/lib/orderEmail";

export interface RefundActionState {
  error?: string;
}

export async function approveRefund(
  refundRequestId: string,
  _prevState: RefundActionState | null,
  _formData: FormData
): Promise<RefundActionState> {
  await requireAdmin();

  const refundRequest = await prisma.refundRequest.findUnique({
    where: { id: refundRequestId },
    include: { order: true, orderItem: true },
  });

  if (!refundRequest) return { error: "Refund request not found." };
  if (refundRequest.status !== "REQUESTED") return {};
  if (!refundRequest.order.paymentIntentId) {
    return { error: "This order has no payment on file to refund against." };
  }

  // Claim the request atomically before calling Stripe, so two concurrent
  // approvals (double-click, two admin tabs) can't both trigger a refund.
  const claimed = await prisma.refundRequest.updateMany({
    where: { id: refundRequestId, status: "REQUESTED" },
    data: { status: "APPROVED" },
  });
  if (claimed.count === 0) return {};

  let stripeRefundId: string;
  try {
    const refund = await getStripe().refunds.create({
      payment_intent: refundRequest.order.paymentIntentId,
      amount: refundRequest.amountCents,
    });
    stripeRefundId = refund.id;
  } catch (err) {
    console.error("Stripe refund failed:", err);
    // Release the claim so the admin can retry.
    await prisma.refundRequest.update({
      where: { id: refundRequestId },
      data: { status: "REQUESTED" },
    });
    return {
      error:
        "Stripe couldn't process this refund. Check the payment details and try again, or contact Stripe support.",
    };
  }

  await prisma.refundRequest.update({
    where: { id: refundRequestId },
    data: { stripeRefundId },
  });

  if (refundRequest.order.customerEmail) {
    try {
      const { error } = await getResend().emails.send({
        from: process.env.ORDER_EMAIL_FROM ?? "orders@orcaaustralia.com",
        to: refundRequest.order.customerEmail,
        subject: "Your refund has been processed",
        html: renderRefundApprovedEmail({
          orderId: refundRequest.orderId,
          productName: refundRequest.orderItem?.productName ?? "your item",
          amountCents: refundRequest.amountCents,
        }),
      });
      if (error) throw error;
    } catch (err) {
      console.error("Refund approval email failed to send:", err);
    }
  }

  revalidatePath("/admin/refunds");
  revalidatePath(`/admin/orders/${refundRequest.orderId}`);
  return {};
}

export async function denyRefund(
  refundRequestId: string,
  _prevState: RefundActionState | null,
  formData: FormData
): Promise<RefundActionState> {
  await requireAdmin();

  const adminNote = String(formData.get("adminNote") ?? "").trim();

  const refundRequest = await prisma.refundRequest.findUnique({
    where: { id: refundRequestId },
    include: { order: true, orderItem: true },
  });

  if (!refundRequest) return { error: "Refund request not found." };

  const claimed = await prisma.refundRequest.updateMany({
    where: { id: refundRequestId, status: "REQUESTED" },
    data: { status: "DENIED", adminNote: adminNote || null },
  });
  if (claimed.count === 0) return {};

  if (refundRequest.order.customerEmail) {
    try {
      const { error } = await getResend().emails.send({
        from: process.env.ORDER_EMAIL_FROM ?? "orders@orcaaustralia.com",
        to: refundRequest.order.customerEmail,
        subject: "About your refund request",
        html: renderRefundDeniedEmail({
          orderId: refundRequest.orderId,
          productName: refundRequest.orderItem?.productName ?? "your item",
          adminNote: adminNote || null,
        }),
      });
      if (error) throw error;
    } catch (err) {
      console.error("Refund denial email failed to send:", err);
    }
  }

  revalidatePath("/admin/refunds");
  revalidatePath(`/admin/orders/${refundRequest.orderId}`);
  return {};
}
