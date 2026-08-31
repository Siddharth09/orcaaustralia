import { NextResponse } from "next/server";
import { z } from "zod";
import { claimMagicLinkRequestSlot, createMagicLinkToken } from "@/lib/magicLink";
import { getResend } from "@/lib/resend";
import { renderMagicLinkEmail } from "@/lib/orderEmail";

const bodySchema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const canSend = await claimMagicLinkRequestSlot(email);
  if (!canSend) {
    return NextResponse.json({ success: true });
  }

  const token = await createMagicLinkToken(email);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = `${siteUrl}/account/verify?token=${encodeURIComponent(token)}`;

  try {
    const { error } = await getResend().emails.send({
      from: process.env.ORDER_EMAIL_FROM ?? "orders@orcaaustralia.com",
      to: email,
      replyTo: "support@astryks.com",
      subject: "Sign in to Orca Australia",
      html: renderMagicLinkEmail(link),
    });
    if (error) throw error;
  } catch (err) {
    console.error("Magic link email failed to send:", err);
    return NextResponse.json(
      { error: "Could not send the sign-in email right now. Please try again shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
