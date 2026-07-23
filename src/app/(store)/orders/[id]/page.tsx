import { Suspense } from "react";
import { notFound } from "next/navigation";

import { requireAuth } from "@core/auth";
import {
  getCatalogOrderForUser,
  OrderDetailContent,
} from "@modules/ecommerce";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const session = await requireAuth();
  const { id } = await params;
  const query = await searchParams;

  const order = await getCatalogOrderForUser(id, session.user.id);
  if (!order) notFound();

  return (
    <Suspense fallback={null}>
      <OrderDetailContent
        order={order}
        banners={{
          paid: query.paid === "1",
          created: query.created === "1",
          cancelled: query.cancelled === "1",
          paymentFailed: query.payment === "failed",
          needsRefund: query.payment === "needs_refund",
        }}
      />
    </Suspense>
  );
}
