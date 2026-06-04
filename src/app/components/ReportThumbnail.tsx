"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const NO_PHOTO = "/images/nophoto.svg";

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
