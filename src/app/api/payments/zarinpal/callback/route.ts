import { NextResponse } from "next/server";

import {
  getPaymentByAuthority,
  hasZarinpalConfig,
  markPaymentSuccess,
  notifyOrderPaid,
  resolveLateGatewayPayment,
  verifyPayment,
} from "@modules/ecommerce";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");
  const orderId = url.searchParams.get("orderId");

  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, url.origin));

  if (!authority || !orderId) {
    return redirectTo("/orders?error=invalid_callback");
  }

  if (status !== "OK") {
    return redirectTo(`/orders/${orderId}?payment=failed`);
  }

  if (!hasZarinpalConfig()) {
    return redirectTo(`/orders/${orderId}?payment=unconfigured`);
  }

  try {
    const payment = await getPaymentByAuthority(authority);
    if (!payment || payment.orderId !== orderId) {
      return redirectTo(`/orders/${orderId}?payment=invalid`);
    }

    if (
      payment.status === "SUCCESS" &&
      payment.order.status !== "CANCELLED"
    ) {
      return redirectTo(`/orders/${orderId}?paid=1`);
    }

    const verified = await verifyPayment({
      authority,
      amount: payment.amount,
    });

    if (!verified.success || !verified.refId) {
      return redirectTo(`/orders/${orderId}?payment=failed`);
    }

    const marked = await markPaymentSuccess({
      paymentId: payment.id,
      orderId,
      refId: verified.refId,
      amount: payment.amount,
    });

    if (marked === "paid" || marked === "already_paid") {
      if (marked === "paid") {
        await notifyOrderPaid(orderId);
      }
      return redirectTo(`/orders/${orderId}?paid=1`);
    }

    const late = await resolveLateGatewayPayment({
      paymentId: payment.id,
      orderId,
      refId: verified.refId,
      amount: payment.amount,
    });

    if (late === "paid" || late === "already_paid" || late === "revived") {
      await notifyOrderPaid(orderId);
      return redirectTo(`/orders/${orderId}?paid=1`);
    }

    if (late === "needs_refund") {
      console.error(
        `[payments] needs_refund orderId=${orderId} authority=${authority}`,
      );
      return redirectTo(`/orders/${orderId}?payment=needs_refund`);
    }

    return redirectTo(`/orders/${orderId}?payment=failed`);
  } catch (err) {
    console.error(err);
    return redirectTo(`/orders/${orderId}?payment=error`);
  }
}
