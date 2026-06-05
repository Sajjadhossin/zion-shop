import { NextResponse } from "next/server";

/**
 * SCAFFOLD — SSLCommerz session create. Docs: https://developer.sslcommerz.com
 * POST store_id/store_passwd + order details to the gateway -> GatewayPageURL,
 * then redirect the customer there. Fill in when sandbox credentials are set.
 */
export async function POST(request: Request) {
  const { SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD } = process.env;
  if (!SSLCOMMERZ_STORE_ID || !SSLCOMMERZ_STORE_PASSWORD) {
    return NextResponse.json(
      { error: "SSLCommerz not configured. Set SSLCOMMERZ_* env vars to enable." },
      { status: 501 }
    );
  }
  // const { orderId, amount } = await request.json();
  // POST form to https://sandbox.sslcommerz.com/gwprocess/v4/api.php -> { GatewayPageURL }
  // return NextResponse.json({ redirectUrl: GatewayPageURL });
  return NextResponse.json({ error: "Not implemented." }, { status: 501 });
}
