import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules:
      process.env.SITE_INDEXABLE === "true"
        ? { userAgent: "*", allow: "/", disallow: "/api/" }
        : { userAgent: "*", disallow: "/" },
    sitemap: process.env.SITE_URL
      ? `${process.env.SITE_URL}/sitemap.xml`
      : undefined,
  };
}
