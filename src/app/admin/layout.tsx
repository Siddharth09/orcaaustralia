import type { ReactNode } from "react";

export const metadata = {
  title: "Admin",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-sand">{children}</div>;
}
