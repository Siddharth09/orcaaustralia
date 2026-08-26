import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-navy">New Product</h1>

      <form action={createProduct} className="mt-6 space-y-4 rounded-lg border border-black/10 bg-white p-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-navy">
            Name
          </label>
          <input
            id="name"
            name="name"
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
            className="mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
        >
          Create Product
        </button>
        <p className="text-xs text-navy/50">
          You&apos;ll add sizes, prices, and photos on the next screen.
        </p>
      </form>
    </div>
  );
}
