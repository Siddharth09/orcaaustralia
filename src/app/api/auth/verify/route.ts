import { NextResponse } from "next/server";
import { verifyMagicLinkToken } from "@/lib/magicLink";
import { getCustomerSession } from "@/lib/customerSession";

export async function GET(request: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/account?error=missing_token`);
  }

  const email = await verifyMagicLinkToken(token);
  if (!email) {
    return NextResponse.redirect(`${siteUrl}/account?error=invalid_link`);
  }

  const session = await getCustomerSession();
  session.email = email;
  await session.save();

  return NextResponse.redirect(`${siteUrl}/account`);
}
