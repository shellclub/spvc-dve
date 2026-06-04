import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function safeFilename(name: string): string | null {
  const base = path.basename(name);
  if (!base || base.includes("..") || /[\\/]/.test(base)) return null;
  return base;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const safe = safeFilename(filename);
  if (!safe) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "report", safe);
  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(safe).toLowerCase();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/images/nophoto.svg", _request.url));
  }
}
