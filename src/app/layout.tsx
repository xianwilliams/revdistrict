import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/700.css";
import "./globals.css";
import "./editorial.css";
import "./atmosphere.css";
import "./services.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-standard-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  style: "normal",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: {
    default: "RevDistrict | Good cars. Real people. | Midvale, Utah",
    template: "%s | RevDistrict",
  },
  description:
    "A car you love. People you’ll actually like. Explore used cars, trucks and SUVs at RevDistrict in Midvale, Utah.",
  robots: {
    index: process.env.SITE_INDEXABLE === "true",
    follow: process.env.SITE_INDEXABLE === "true",
  },
  openGraph: {
    type: "website",
    siteName: "RevDistrict",
    images: [
      {
        url: "/images/revdistrict-transparent.png",
        width: 1536,
        height: 1024,
        type: "image/png",
        alt: "RevDistrict logo",
      },
    ],
  },
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#080808" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://cdn.dealrimages.com" />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
