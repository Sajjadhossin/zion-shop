import { NextResponse } from "next/server";

/**
 * SCAFFOLD — SSLCommerz IPN (webhook). The gateway POSTs the transaction
 * result here. Validate it (val_id -> validation API), then mark the order
 * PAID/FAILED. Must be a public URL configured in the SSLCommerz panel.
 */
export async function POST(request: Request) {
  // const body = await request.formData();
  // const valId = body.get("val_id");
  // validate against the gateway, then update the order's Payment row.
  return NextResponse.json({ received: true });
}
