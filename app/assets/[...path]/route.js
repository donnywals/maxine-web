import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

const CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

export async function GET(_request, { params }) {
  const segments = await params;
  const assetPath = path.join(process.cwd(), "assets", ...segments.path);
  const root = path.join(process.cwd(), "assets");

  if (!assetPath.startsWith(root)) {
    notFound();
  }

  try {
    const file = await fs.readFile(assetPath);
    const ext = path.extname(assetPath).toLowerCase();
    return new Response(file, {
      headers: {
        "content-type": CONTENT_TYPES[ext] || "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    notFound();
  }
}
