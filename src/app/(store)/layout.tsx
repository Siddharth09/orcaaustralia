import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartDrawer } from "@/components/CartDrawer";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  );
}
