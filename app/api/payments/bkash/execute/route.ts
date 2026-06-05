import { NextResponse } from "next/server";

/**
 * SCAFFOLD — bKash "execute payment". Called after the customer authorizes.
 * POST {BKASH_BASE_URL}/tokenized/checkout/execute with { paymentID } ->
 * on success (transactionStatus "Completed") mark Order/Payment PAID.
 */
export async function POST(request: Request) {
  // const { paymentID } = await request.json();
  // const result = await executeBkashPayment(paymentID);
  // if (result.statusCode === "0000") { update order -> PAID; }
  return NextResponse.json({ error: "Not implemented." }, { status: 501 });
}
