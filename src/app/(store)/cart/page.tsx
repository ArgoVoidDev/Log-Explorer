import type { Metadata } from "next";

import { CartPageContent } from "@modules/ecommerce";

export const metadata: Metadata = {
  title: "سبد خرید",
  robots: { index: false },
};

export default function CartPage() {
  return <CartPageContent />;
}
