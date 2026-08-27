"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatCents } from "@/lib/money";

export interface VariantOption {
  id: string;
  size: string;
  sku: string;
  priceCents: number;
  stock: number;
}

export function AddToCartForm({
  productSlug,
  productName,
  image,
  variants,
}: {
  productSlug: string;
  productName: string;
  image: string | null;
  variants: VariantOption[];
}) {
  const { addItem, openCart } = useCart();
  const [selectedId, setSelectedId] = useState(
    variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id ?? ""
  );
  const [quantity, setQuantity] = useState(1);

  const selected = variants.find((v) => v.id === selectedId);
  const outOfStock = !selected || selected.stock <= 0;

  function selectVariant(variantId: string) {
    setSelectedId(variantId);
    setQuantity(1);
  }

  function updateQuantity(rawValue: number) {
    if (!Number.isFinite(rawValue)) return;
    const ceiling = selected ? Math.max(1, selected.stock) : 999;
    setQuantity(Math.min(ceiling, Math.max(1, Math.round(rawValue))));
  }

  return (
    <div>
      <p className="text-2xl font-medium text-navy">
        {selected ? formatCents(selected.priceCents) : ""}
      </p>

      <div className="mt-6">
        <p className="text-sm font-medium text-navy">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => selectVariant(variant.id)}
              disabled={variant.stock <= 0}
              className={`rounded border px-4 py-2 text-sm font-medium transition ${
                selectedId === variant.id
                  ? "border-navy bg-navy text-white"
                  : "border-black/20 text-navy hover:border-navy"
              } ${variant.stock <= 0 ? "cursor-not-allowed opacity-40" : ""}`}
            >
              {variant.size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <label className="text-sm font-medium text-navy" htmlFor="quantity">
          Qty
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={selected ? Math.max(1, selected.stock) : undefined}
          value={quantity}
          onChange={(e) => updateQuantity(Number(e.target.value))}
          className="w-16 rounded border border-black/20 px-2 py-1 text-sm"
        />
      </div>

      <button
        disabled={outOfStock}
        onClick={() => {
          if (!selected) return;
          addItem({
            variantId: selected.id,
            productSlug,
            productName,
            size: selected.size,
            sku: selected.sku,
            unitPriceCents: selected.priceCents,
            quantity,
            image,
            stock: selected.stock,
          });
          openCart();
        }}
        className="mt-8 w-full rounded-full bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-40 sm:w-auto sm:px-10"
      >
        {outOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}
