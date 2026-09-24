import type { MetadataRoute } from "next";
import { getInventory } from "@/lib/inventory";
import { vehicleHref } from "@/lib/vehicle";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!process.env.SITE_URL) return [];
  const base = process.env.SITE_URL;
  const data = await getInventory();
  return [
    ...[
      "",
      "/inventory",
      "/our-story",
      "/financing",
      "/sell-your-vehicle",
      "/contact-us",
      "/privacy-policy",
    ].map((path) => ({ url: base + path })),
    ...(!data.isPreview
      ? data.vehicles.map((v) => ({
          url: base + vehicleHref(v),
          lastModified: data.updatedAt,
        }))
      : []),
  ];
}
