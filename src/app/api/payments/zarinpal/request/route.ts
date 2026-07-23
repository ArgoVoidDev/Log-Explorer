import { NextResponse } from "next/server";

import { auth } from "@core/auth";
import {
  getCatalogOrderForUser,
  getZarinpalStartPayBase,
  hasZarinpalConfig,
  requestPayment,
  setPaymentAuthority,
} from "@modules/ecommerce";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasZarinpalConfig()) {
    return NextResponse.json(
      { error: "Payment gateway not configured" },
      { status: 503 },
    );
  }

  let body: { orderId?: string };
  try {
    body = (await request.json()) as { orderId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const orderId = body.orderId;
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await getCatalogOrderForUser(orderId, session.user.id);
  if (!order || !order.payment || order.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: "Order not payable" }, { status: 400 });
  }

  try {
    if (order.payment.authority) {
      return NextResponse.json({
        gatewayUrl: `${getZarinpalStartPayBase()}/${order.payment.authority}`,
      });
    }

    const { authority, gatewayUrl } = await requestPayment({
      amount: order.total,
      description: `سفارش ${order.id.slice(-8)}`,
      orderId: order.id,
    });
    await setPaymentAuthority(order.payment.id, authority);
    return NextResponse.json({ gatewayUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment request failed" },
      { status: 500 },
    );
  }
}
