"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/** inline SVG — ไม่พึ่งไฟล์ใน public (volume mount บน server อาจทับ public/) */
const NO_PHOTO =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="12" fill="#F3F4F6"/><path d="M36 78V54L48 42L72 66L84 54V78H36Z" stroke="#9CA3AF" stroke-width="3" fill="none"/><circle cx="46" cy="46" r="6" fill="#D1D5DB"/></svg>'
  );

export function hasReportImage(image?: string | null): boolean {
  if (!image) return false;
  const v = image.trim().toLowerCase();
  return v !== "" && v !== "null" && v !== "undefined";
}

export function reportImageUrl(image?: string | null): string {
  if (!hasReportImage(image)) return NO_PHOTO;
  return `/report/${image}`;
}

type ReportThumbnailProps = {
  image?: string | null;
  alt: string;
  className?: string;
};

export function ReportThumbnail({ image, alt, className = "" }: ReportThumbnailProps) {
  const [src, setSrc] = useState(() =>
    hasReportImage(image) ? reportImageUrl(image) : NO_PHOTO
  );

  useEffect(() => {
    setSrc(hasReportImage(image) ? reportImageUrl(image) : NO_PHOTO);
  }, [image]);

  const isPlaceholder = src === NO_PHOTO;

  return (
    <div
      className={`relative bg-gray-100 flex items-center justify-center overflow-hidden ${className}`}
    >
      <Image
        src={src}
        alt={isPlaceholder ? "ไม่มีรูป" : alt}
        fill
        className={isPlaceholder ? "object-contain p-3" : "object-cover"}
        unoptimized
        onError={() => setSrc(NO_PHOTO)}
      />
    </div>
  );
}
