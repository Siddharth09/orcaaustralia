import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { renderOrderConfirmationEmail } from "@/lib/orderEmail";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const existing = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
    });
    if (existing) {
      return NextResponse.json({ received: true });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
      limit: 100,
    });

    const items = lineItems.data.map((li) => {
      const product = li.price?.product as Stripe.Product;
      return {
        variantId: product.metadata.variantId ?? null,
        size: product.metadata.size ?? "",
        sku: product.metadata.sku ?? "",
        productName: product.name,
        quantity: li.quantity ?? 1,
        unitPriceCents: li.price?.unit_amount ?? 0,
      };
    });

    const order = await prisma.order.create({
      data: {
        stripeSessionId: session.id,
        customerEmail: session.customer_details?.email ?? "",
        customerName: session.customer_details?.name ?? undefined,
        shippingAddress: session.collected_information?.shipping_details
          ? JSON.parse(JSON.stringify(session.collected_information.shipping_details))
          : undefined,
        totalCents: session.amount_total ?? 0,
        status: "PAID",
        items: {
          create: items.map((item) => ({
            variantId: item.variantId || undefined,
            productName: item.productName,
            size: item.size,
            sku: item.sku,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
          })),
        },
      },
      include: { items: true },
    });

    await Promise.all(
      items
        .filter((item) => item.variantId)
        .map((item) =>
          prisma.variant.update({
            where: { id: item.variantId! },
            data: { stock: { decrement: item.quantity } },
          })
        )
    );

    if (order.customerEmail && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.ORDER_EMAIL_FROM ?? "orders@orcaaustralia.com",
          to: order.customerEmail,
          subject: "Your Orca Australia order is confirmed",
          html: renderOrderConfirmationEmail(order),
        });
      } catch (err) {
        // The order is already saved; don't fail the webhook (Stripe would
        // retry and, since the order now exists, never retry the email).
        console.error("Order confirmation email failed to send:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
