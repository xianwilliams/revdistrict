import type { ImageLoaderProps } from "next/image";

// Only apply provider-specific transforms to the CDN we have verified.
// A different DMS image host continues to work with its original URL.
export function canResizeVehicleImage(src: string) {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname === "cdn.dealrimages.com";
  } catch {
    return false;
  }
}
export function vehicleImageLoader({ src, width }: ImageLoaderProps) {
  if (!canResizeVehicleImage(src)) return src;
  const url = new URL(src);
  url.searchParams.set("w", String(Math.min(width, 1600)));
  return url.href;
}
