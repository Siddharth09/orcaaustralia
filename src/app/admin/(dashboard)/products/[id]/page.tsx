import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SIZE_ORDER } from "@/lib/constants";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
} from "../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!product) notFound();

  const variants = [...product.variants].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
  );
  const existingSizes = new Set(variants.map((v) => v.size));
  const availableSizes = SIZE_ORDER.filter((s) => !existingSizes.has(s));

  const boundUpdateProduct = updateProduct.bind(null, id);
  const boundDeleteProduct = deleteProduct.bind(null, id);
  const boundAddVariant = addVariant.bind(null, id);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy">{product.name}</h1>
      </div>

      <form
        action={boundUpdateProduct}
        className="space-y-4 rounded-lg border border-black/10 bg-white p-6"
      >
        <h2 className="text-sm font-semibold text-navy">Details</h2>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-navy">
            Name
          </label>
          <input
            id="name"
            name="name"
            defaultValue={product.name}
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-navy">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={product.category}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm"
          >
            <option value="SHORTS">Swim Shorts</option>
            <option value="BOXER_BRIEF">Tencel Modal Boxer Briefs</option>
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-navy">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product.description}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="badge" className="block text-sm font-medium text-navy">
            Badge <span className="text-navy/50">(optional, e.g. &quot;New&quot;)</span>
          </label>
          <input
            id="badge"
            name="badge"
            defaultValue={product.badge ?? ""}
            placeholder="New"
            className="mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" name="active" defaultChecked={product.active} />
          Visible in store
        </label>
        <button
          type="submit"
          className="rounded-full bg-navy px-6 py-2 text-sm font-semibold text-white hover:bg-navy-dark"
        >
          Save Details
        </button>
      </form>

      <div className="rounded-lg border border-black/10 bg-white p-6">
        <h2 className="text-sm font-semibold text-navy">Photos</h2>
        <div className="mt-4">
          <ImageUploader
            productId={product.id}
            images={product.images}
            coverImageUrl={product.coverImageUrl}
          />
        </div>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-6">
        <h2 className="text-sm font-semibold text-navy">Sizes &amp; Stock</h2>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-navy/60">
            <tr>
              <th className="py-2">Size</th>
              <th className="py-2">SKU</th>
              <th className="py-2">Price (AUD)</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Active</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => {
              const boundUpdateVariant = updateVariant.bind(null, variant.id, id);
              const boundDeleteVariant = deleteVariant.bind(null, variant.id, id);
              return (
                <tr key={variant.id} className="border-t border-black/5">
                  <td className="py-2 font-medium text-navy">{variant.size}</td>
                  <td className="py-2 text-navy/70">{variant.sku}</td>
                  <td className="py-2">
                    <form action={boundUpdateVariant} className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        defaultValue={(variant.priceCents / 100).toFixed(2)}
                        className="w-20 rounded border border-black/20 px-2 py-1"
                      />
                      <input
                        type="number"
                        name="stock"
                        defaultValue={variant.stock}
                        className="w-16 rounded border border-black/20 px-2 py-1"
                      />
                      <label className="flex items-center gap-1 text-xs text-navy/70">
                        <input
                          type="checkbox"
                          name="active"
                          defaultChecked={variant.active}
                        />
                        Active
                      </label>
                      <button
                        type="submit"
                        className="rounded bg-navy px-3 py-1 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td></td>
                  <td></td>
                  <td className="py-2">
                    <form action={boundDeleteVariant}>
                      <button className="text-xs text-red-600 underline">Delete</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {availableSizes.length > 0 && (
          <form
            action={boundAddVariant}
            className="mt-6 flex flex-wrap items-end gap-3 border-t border-black/10 pt-4"
          >
            <div>
              <label htmlFor="size" className="block text-xs font-medium text-navy">
                Size
              </label>
              <select
                id="size"
                name="size"
                className="mt-1 rounded border border-black/20 px-2 py-1.5 text-sm"
              >
                {availableSizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sku" className="block text-xs font-medium text-navy">
                SKU
              </label>
              <input
                id="sku"
                name="sku"
                required
                placeholder={`ORCA-${product.category === "SHORTS" ? "SH" : "BB"}-...`}
                className="mt-1 rounded border border-black/20 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-xs font-medium text-navy">
                Price (AUD)
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                name="price"
                required
                className="mt-1 w-24 rounded border border-black/20 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-xs font-medium text-navy">
                Stock
              </label>
              <input
                id="stock"
                type="number"
                name="stock"
                defaultValue={0}
                className="mt-1 w-20 rounded border border-black/20 px-2 py-1.5 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-dark"
            >
              Add Size
            </button>
          </form>
        )}
      </div>

      <form action={boundDeleteProduct}>
        <button className="text-sm text-red-600 underline">Delete product</button>
      </form>
    </div>
  );
}
