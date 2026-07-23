import { notFound } from "next/navigation";

import {
  ensureModulesLoaded,
  getAdminViewByPath,
} from "@core/admin";

type AdminCatchAllProps = {
  params: Promise<{ slug?: string[] }>;
};

function pathFromSlug(slug?: string[]): string {
  if (!slug || slug.length === 0) return "/admin";
  return `/admin/${slug.join("/")}`;
}

export default async function AdminCatchAllPage({ params }: AdminCatchAllProps) {
  await ensureModulesLoaded();
  const { slug } = await params;
  const pathname = pathFromSlug(slug);
  const view = getAdminViewByPath(pathname);

  if (!view) notFound();

  const View = view.View;
  return <View />;
}
