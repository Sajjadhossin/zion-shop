import { NextResponse } from "next/server";

/**
 * SCAFFOLD — bKash "create payment". Docs: https://developer.bka.sh
 * Flow: grant token -> create payment -> return { paymentID, bkashURL } for the
 * client to redirect to. Fill in when merchant + sandbox credentials are ready.
 */
export async function POST(request: Request) {
  const { BKASH_USERNAME, BKASH_APP_KEY } = process.env;
  if (!BKASH_USERNAME || !BKASH_APP_KEY) {
    return NextResponse.json(
      { error: "bKash not configured. Set BKASH_* env vars to enable." },
      { status: 501 }
    );
  }
  // const { orderId, amount } = await request.json();
  // 1) POST {BKASH_BASE_URL}/tokenized/checkout/token/grant   -> id_token
  // 2) POST {BKASH_BASE_URL}/tokenized/checkout/create        -> { paymentID, bkashURL }
  // Persist paymentID against the order, then:
  // return NextResponse.json({ paymentID, bkashURL });
  return NextResponse.json({ error: "Not implemented." }, { status: 501 });
}
