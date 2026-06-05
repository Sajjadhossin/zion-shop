import { NextResponse } from "next/server";

/**
 * SCAFFOLD — bKash callback/redirect target. bKash returns ?paymentID=&status=.
 * On status "success" call execute, update the order, then redirect to the
 * confirmation page; otherwise redirect back to checkout with an error.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const status = searchParams.get("status");
  // const paymentID = searchParams.get("paymentID");
  if (status === "success") {
    // execute + update order, then:
    return NextResponse.redirect(`${origin}/checkout?bkash=pending`);
  }
  return NextResponse.redirect(`${origin}/checkout?error=bkash`);
}
