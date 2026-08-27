import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";
import { renderOrderConfirmationEmail } from "@/lib/orderEmail";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
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

    const lineItems = await getStripe().checkout.sessions.listLineItems(session.id, {
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

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    let order;
    try {
      order = await prisma.order.create({
        data: {
          stripeSessionId: session.id,
          paymentIntentId,
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
    } catch (err) {
      // Unique constraint on stripeSessionId means a concurrent delivery of
      // this same event already created the order — treat as success.
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code?: string }).code === "P2002"
      ) {
        return NextResponse.json({ received: true });
      }
      throw err;
    }

    const decrementResults = await Promise.allSettled(
      items
        .filter((item) => item.variantId)
        .map((item) =>
          prisma.$executeRaw`UPDATE "Variant" SET stock = GREATEST(stock - ${item.quantity}, 0) WHERE id = ${item.variantId}`
        )
    );
    decrementResults.forEach((result, i) => {
      if (result.status === "rejected") {
        console.error(
          `Stock decrement failed for variant ${items.filter((it) => it.variantId)[i]?.variantId}:`,
          result.reason
        );
      }
    });

    if (order.customerEmail && process.env.RESEND_API_KEY) {
      try {
        const variantIds = order.items
          .map((item) => item.variantId)
          .filter((id): id is string => Boolean(id));
        const variants = await prisma.variant.findMany({
          where: { id: { in: variantIds } },
          include: { product: { select: { coverImageUrl: true } } },
        });
        const imageByVariantId = new Map(
          variants.map((v) => [v.id, v.product.coverImageUrl])
        );

        const { error } = await getResend().emails.send({
          from: process.env.ORDER_EMAIL_FROM ?? "orders@orcaaustralia.com",
          to: order.customerEmail,
          subject: "Your Orca Australia order is confirmed",
          html: renderOrderConfirmationEmail({
            ...order,
            items: order.items.map((item) => ({
              ...item,
              imageUrl: item.variantId
                ? imageByVariantId.get(item.variantId)
                : null,
            })),
          }),
        });
        if (error) throw error;
      } catch (err) {
        // The order is already saved; don't fail the webhook (Stripe would
        // retry and, since the order now exists, never retry the email).
        console.error("Order confirmation email failed to send:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
