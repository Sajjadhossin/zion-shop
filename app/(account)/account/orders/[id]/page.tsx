import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrderForUser } from "@/lib/queries/orders";
import { getUserReviewsForProducts } from "@/lib/queries/account";
import { StatusBadge } from "@/components/account/status-badge";
import { ProductImage } from "@/components/shop/product-image";
import { ReviewDisclosure } from "@/components/account/review-disclosure";
import { cn, formatBDT } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Detail" };

const FLOW = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const order = await getOrderForUser(user.id, id);
  if (!order) notFound();

  const cancelled = order.orderStatus === "CANCELLED";
  const delivered = order.orderStatus === "DELIVERED";
  const currentIdx = FLOW.indexOf(order.orderStatus);

  const reviews = delivered
    ? await getUserReviewsForProducts(
        user.id,
        order.items.map((it) => it.productId)
      )
    : new Map<string, { rating: number; comment: string }>();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link href="/account/orders" className="text-sm text-brand-600 hover:underline">
            ← Orders
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-neutral-500">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={order.orderStatus} />
          <StatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Status timeline */}
      {cancelled ? (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          This order was cancelled.
        </p>
      ) : (
        <div className="mt-8 flex items-center">
          {FLOW.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                    i <= currentIdx
                      ? "bg-brand-600 text-white"
                      : "bg-neutral-200 text-neutral-500"
                  )}
                >
                  {i + 1}
                </span>
                <span className="mt-1 text-[10px] uppercase tracking-wide text-neutral-500">
                  {s}
                </span>
              </div>
              {i < FLOW.length - 1 && (
                <span
                  className={cn(
                    "mx-1 h-0.5 flex-1",
                    i < currentIdx ? "bg-brand-600" : "bg-neutral-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {delivered && (
        <p className="mt-8 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Your order was delivered — you can now review what you bought below.
        </p>
      )}

      {/* Items */}
      <ul className="mt-4 divide-y divide-neutral-100 rounded-xl border border-neutral-200 px-5">
        {order.items.map((it) => {
          const r = reviews.get(it.productId);
          return (
            <li key={it.id} className="py-4">
              <div className="flex gap-3">
                <div className="h-16 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  <ProductImage src={it.image} alt={it.name} label={it.name} className="h-full w-full" />
                </div>
                <div className="flex-1 text-sm">
                  <Link href={`/product/${it.slug}`} className="font-medium hover:text-brand-600">
                    {it.name}
                  </Link>
                  <p className="text-neutral-500">
                    {it.color} / {it.size} · Qty {it.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatBDT(it.price * it.quantity)}</p>
              </div>
              {delivered && (
                <ReviewDisclosure
                  productId={it.productId}
                  reviewed={!!r}
                  rating={r?.rating ?? 0}
                  comment={r?.comment ?? ""}
                />
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 p-5 text-sm">
          <p className="font-medium">Shipping address</p>
          <p className="mt-2 text-neutral-600">
            {order.address.fullName}, {order.address.phone}
            <br />
            {order.address.addressLine}, {order.address.city}, {order.address.district}
            {order.address.postalCode ? ` – ${order.address.postalCode}` : ""}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 p-5 text-sm">
          <p className="font-medium">Payment</p>
          <div className="mt-2 space-y-1 text-neutral-600">
            <div className="flex justify-between"><span>Method</span><span>{order.paymentMethod}</span></div>
            <div className="flex justify-between"><span>Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{order.shippingFee === 0 ? "Free" : formatBDT(order.shippingFee)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatBDT(order.discount)}</span></div>
            )}
            <div className="flex justify-between border-t border-neutral-100 pt-1 font-semibold text-neutral-900"><span>Total</span><span>{formatBDT(order.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
