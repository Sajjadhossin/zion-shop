import "server-only";

type OrderEmail = {
  orderNumber: string;
  total: number;
  paymentMethod: string;
  customerName: string;
};

/**
 * Sends an order confirmation via Resend's REST API (no SDK needed).
 * No-ops gracefully if RESEND_API_KEY is not configured.
 */
export async function sendOrderConfirmation(to: string, order: OrderEmail) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "orders@zionshop.com";
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping confirmation email.");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Your order ${order.orderNumber} is confirmed`,
        html: `
          <h2>Thank you, ${order.customerName || "valued customer"}!</h2>
          <p>Your order <strong>${order.orderNumber}</strong> has been placed.</p>
          <p>Total: <strong>৳${order.total.toLocaleString("en-BD")}</strong></p>
          <p>Payment method: ${order.paymentMethod}</p>
          <p>We'll notify you when it ships.</p>
        `,
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend responded", res.status, await res.text());
    }
  } catch (e) {
    console.error("[email] send failed", e);
  }
}
