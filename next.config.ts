import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: {
    deviceSizes: [360, 540, 750, 1080, 1440, 1600],
    imageSizes: [96, 160, 240, 320],
  },
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/contact", destination: "/contact-us", permanent: true },
      {
        source: "/trade-in",
        destination: "/sell-your-vehicle",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};
export default config;
