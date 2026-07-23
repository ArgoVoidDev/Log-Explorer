import type { Metadata } from "next";

import { PortfolioShell, portfolioConfig } from "@modules/portfolio";

export const metadata: Metadata = {
  title: {
    default: portfolioConfig.name,
    template: `%s · ${portfolioConfig.name}`,
  },
  description: portfolioConfig.tagline,
};

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PortfolioShell>{children}</PortfolioShell>;
}
