import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS } from "@/lib/constants";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { variants: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-dark"
        >
          New Product
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-black/10 bg-sand text-left text-navy/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium text-navy underline"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-navy/80">
                  {CATEGORY_LABELS[product.category]}
                </td>
                <td className="px-4 py-3 text-navy/80">{product.variants.length}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      product.active
                        ? "bg-green-100 text-green-700"
                        : "bg-black/5 text-navy/50"
                    }`}
                  >
                    {product.active ? "Active" : "Hidden"}
                  </span>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-navy/50">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
