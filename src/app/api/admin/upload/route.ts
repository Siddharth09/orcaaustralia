import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
  }

  const extension = file.name.split(".").pop() || "jpg";
  const pathname = `products/${crypto.randomUUID()}.${extension}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Vercel Blob upload failed:", err);
    return NextResponse.json(
      { error: "Photo storage is not configured correctly. Please try again later." },
      { status: 502 }
    );
  }
}
