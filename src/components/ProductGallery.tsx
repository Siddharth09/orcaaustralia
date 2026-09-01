"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) return null;

  const showPrev = () => setSelected((i) => (i - 1 + images.length) % images.length);
  const showNext = () => setSelected((i) => (i + 1) % images.length);

  return (
    <div className="space-y-4">
      <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-sand">
        <Image
          src={images[selected]}
          alt={productName}
          fill
          priority
          className="object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy opacity-0 transition hover:bg-white group-hover:opacity-100"
            >
              &#8249;
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy opacity-0 transition hover:bg-white group-hover:opacity-100"
            >
              &#8250;
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {selected + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === selected}
              className={`relative aspect-square w-16 flex-shrink-0 overflow-hidden rounded border-2 bg-sand transition ${
                i === selected
                  ? "border-navy"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
