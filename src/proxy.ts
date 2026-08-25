import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";
import { sessionOptions, type AdminSessionData } from "@/lib/session";

async function isAdminAuthenticated(request: NextRequest) {
  const cookie = request.cookies.get(sessionOptions.cookieName)?.value;
  if (!cookie) return false;
  try {
    const data = await unsealData<AdminSessionData>(cookie, {
      password: sessionOptions.password as string,
    });
    return Boolean(data.isAdmin);
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";
  const isProtectedPage = pathname.startsWith("/admin") && !isLoginRoute;
  const isProtectedApi = pathname.startsWith("/api/admin");

  if (isProtectedPage || isProtectedApi) {
    const authed = await isAdminAuthenticated(request);
    if (!authed) {
      if (isProtectedApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
