import Link from "next/link";

import { buttonVariants, Typography } from "@core/ui";

/** Fallback for payment callback errors without an order id. */
export default function OrdersIndexPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-16 text-center">
      <Typography className="text-[var(--store-ink)]">
        سفارش یافت نشد یا لینک پرداخت نامعتبر است.
      </Typography>
      <Link href="/shop" className={buttonVariants({ size: "lg" })}>
        بازگشت به فروشگاه
      </Link>
    </div>
  );
}
