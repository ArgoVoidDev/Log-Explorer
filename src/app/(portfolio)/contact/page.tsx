import type { Metadata } from "next";

import { ContactContent } from "@modules/portfolio";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach out on Instagram or Telegram — no contact form.",
};

export default function ContactPage() {
  return <ContactContent />;
}
