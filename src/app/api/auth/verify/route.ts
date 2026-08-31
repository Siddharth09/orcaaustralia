import { NextResponse } from "next/server";

// Kept as a redirect shim for magic-link emails sent before the sign-in
// confirmation step was introduced (GET requests here used to log the user
// in directly, which let email security scanners burn the single-use token
// before the recipient ever clicked it — see /account/verify).
export async function GET(request: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/account?error=missing_token`);
  }

  return NextResponse.redirect(
    `${siteUrl}/account/verify?token=${encodeURIComponent(token)}`
  );
}
