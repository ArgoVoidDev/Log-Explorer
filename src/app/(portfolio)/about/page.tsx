import type { Metadata } from "next";

import { AboutContent } from "@modules/portfolio";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return <AboutContent />;
}
