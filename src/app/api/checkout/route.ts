import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { FLAT_SHIPPING_CENTS, FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/constants";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const variantIds = parsed.data.items.map((i) => i.variantId);
  const variants = await prisma.variant.findMany({
    where: { id: { in: variantIds }, active: true },
    include: { product: true },
  });

  if (variants.length !== variantIds.length) {
    return NextResponse.json(
      { error: "One or more items are no longer available" },
      { status: 400 }
    );
  }

  let subtotalCents = 0;
  for (const item of parsed.data.items) {
    const variant = variants.find((v) => v.id === item.variantId)!;
    if (variant.stock < item.quantity) {
      return NextResponse.json(
        { error: `${variant.product.name} (${variant.size}) has limited stock` },
        { status: 400 }
      );
    }
    subtotalCents += variant.priceCents * item.quantity;
  }

  const shippingCents =
    subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;

  const lineItems = parsed.data.items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId)!;
    return {
      quantity: item.quantity,
      price_data: {
        currency: "aud",
        unit_amount: variant.priceCents,
        product_data: {
          name: `${variant.product.name} — ${variant.size}`,
          images: variant.product.coverImageUrl
            ? [variant.product.coverImageUrl]
            : undefined,
          metadata: {
            variantId: variant.id,
            size: variant.size,
            sku: variant.sku,
          },
        },
      },
    };
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let session;
  try {
    session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["AU"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingCents, currency: "aud" },
            display_name: shippingCents === 0 ? "Free shipping" : "Standard shipping",
          },
        },
      ],
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
    });
  } catch (err) {
    console.error("Stripe checkout session creation failed:", err);
    return NextResponse.json(
      { error: "Payment provider is not configured correctly. Please try again later." },
      { status: 502 }
    );
  }

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
