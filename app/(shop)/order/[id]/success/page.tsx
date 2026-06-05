import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrderForUser } from "@/lib/queries/orders";
import { ProductImage } from "@/components/shop/product-image";
import { formatBDT } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Confirmed" };

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/order/${id}/success`);

  const order = await getOrderForUser(user.id, id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <div className="text-center">
        <CheckCircle2 className="mx-auto text-green-500" size={56} />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Thank you for your order!
        </h1>
        <p className="mt-2 text-neutral-500">
          Order <span className="font-medium text-neutral-700">{order.orderNumber}</span> has
          been placed. A confirmation has been sent to your email.
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-neutral-200">
        <div className="border-b border-neutral-100 px-6 py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Payment</span>
            <span className="font-medium">
              {order.paymentMethod} · {order.paymentStatus}
            </span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-neutral-500">Status</span>
            <span className="font-medium">{order.orderStatus}</span>
          </div>
        </div>

        <ul className="divide-y divide-neutral-100 px-6">
          {order.items.map((it) => (
            <li key={it.id} className="flex gap-3 py-4">
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
            </li>
          ))}
        </ul>

        <div className="space-y-1 border-t border-neutral-100 px-6 py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span>{formatBDT(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Shipping</span>
            <span>{order.shippingFee === 0 ? "Free" : formatBDT(order.shippingFee)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>−{formatBDT(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatBDT(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 px-6 py-4 text-sm">
        <p className="font-medium">Shipping to</p>
        <p className="mt-1 text-neutral-600">
          {order.address.fullName}, {order.address.phone}
          <br />
          {order.address.addressLine}, {order.address.city}, {order.address.district}
          {order.address.postalCode ? ` – ${order.address.postalCode}` : ""}
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/products" className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:border-neutral-400">
          Continue shopping
        </Link>
        <Link href="/account" className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
          View my orders
        </Link>
      </div>
    </div>
  );
}
