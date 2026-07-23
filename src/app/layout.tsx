import { Manrope, Syne } from "next/font/google";

import { buildRootMetadata, JsonLd, buildWebSiteJsonLd } from "@core/seo";
import { saasConfig } from "@modules/saas";

import "./globals.css";

/**
 * Root layout — Server Component only.
 * Do not add `"use client"`, providers, or hooks here.
 * Mount interactive islands in nested layouts / pages via `clientIsland()`.
 */

const portfolioSans = Manrope({
  subsets: ["latin"],
  variable: "--font-portfolio-sans",
  display: "swap",
});

const portfolioDisplay = Syne({
  subsets: ["latin"],
  variable: "--font-portfolio-display",
  display: "swap",
});

export const metadata = buildRootMetadata({
  name: saasConfig.name,
  description: saasConfig.tagline,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${portfolioSans.variable} ${portfolioDisplay.variable}`}
    >
      <body className="min-h-screen font-[family-name:var(--font-portfolio-sans)] antialiased">
        <JsonLd
          id="site-jsonld"
          data={buildWebSiteJsonLd({
            name: saasConfig.name,
            description: saasConfig.tagline,
          })}
        />
        {children}
      </body>
    </html>
  );
}
