import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "گالری آثار",
  description: "گالری آثار آماده و نمونه‌های قابل سفارش",
};

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
