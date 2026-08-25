"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { addImage, removeImage, setCoverImage } from "@/app/admin/(dashboard)/products/actions";

export function ImageUploader({
  productId,
  images,
  coverImageUrl,
}: {
  productId: string;
  images: string[];
  coverImageUrl: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      startTransition(() => {
        addImage(productId, data.url);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img} className="relative aspect-square overflow-hidden rounded border border-black/10">
            <Image src={img} alt="Product" fill className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-1 py-1 text-[10px] text-white">
              <button
                onClick={() => startTransition(() => setCoverImage(productId, img))}
                className="underline disabled:opacity-50"
                disabled={coverImageUrl === img}
              >
                {coverImageUrl === img ? "Cover" : "Set cover"}
              </button>
              <button
                onClick={() => startTransition(() => removeImage(productId, img))}
                className="underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <label className="mt-4 inline-block cursor-pointer rounded-full border border-navy/30 px-4 py-2 text-sm font-medium text-navy hover:bg-sand">
        {uploading || isPending ? "Uploading..." : "Upload Photo"}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
