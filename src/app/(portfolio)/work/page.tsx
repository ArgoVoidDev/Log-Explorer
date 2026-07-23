import type { Metadata } from "next";

import { WorkPageContent } from "@modules/portfolio";

export const metadata: Metadata = {
  title: "Work",
};

export default function WorkPage() {
  return <WorkPageContent />;
}
