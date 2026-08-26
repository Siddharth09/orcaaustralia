import { NextResponse } from "next/server";
import { z } from "zod";
import { getResend } from "@/lib/resend";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().email(),
  orderNumber: z.string().trim().max(20).optional(),
  message: z.string().trim().min(1).max(5000),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  const { name, email, orderNumber, message } = parsed.data;

  try {
    const { error } = await getResend().emails.send({
      from: process.env.ORDER_EMAIL_FROM ?? "orders@orcaaustralia.com",
      to: "support@astryks.com",
      replyTo: email,
      subject: orderNumber
        ? `Support request — Order #${orderNumber}`
        : `Support request from ${name}`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;">
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${orderNumber ? `<p><strong>Order number:</strong> ${escapeHtml(orderNumber)}</p>` : ""}
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
        </div>
      `,
    });
    if (error) throw error;
  } catch (err) {
    console.error("Contact form email failed to send:", err);
    return NextResponse.json(
      { error: "Could not send your message right now. Please email support@astryks.com directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
