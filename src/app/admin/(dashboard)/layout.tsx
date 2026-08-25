import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";

async function logout() {
  "use server";
  const session = await getAdminSession();
  session.destroy();
  redirect("/admin/login");
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAdminSession();
  if (!session.isAdmin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 flex-shrink-0 border-r border-black/10 bg-white px-4 py-6">
        <p className="px-2 text-sm font-semibold text-navy">Orca Australia</p>
        <nav className="mt-6 space-y-1 text-sm">
          <Link
            href="/admin"
            className="block rounded px-2 py-2 font-medium text-navy/80 hover:bg-sand"
          >
            Overview
          </Link>
          <Link
            href="/admin/orders"
            className="block rounded px-2 py-2 font-medium text-navy/80 hover:bg-sand"
          >
            Orders
          </Link>
          <Link
            href="/admin/products"
            className="block rounded px-2 py-2 font-medium text-navy/80 hover:bg-sand"
          >
            Products
          </Link>
        </nav>
        <form action={logout} className="mt-10 px-2">
          <button className="text-xs text-navy/50 underline hover:text-navy">
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
