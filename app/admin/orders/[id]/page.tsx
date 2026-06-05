import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrder } from "@/lib/queries/admin";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { StatusBadge } from "@/components/account/status-badge";
import { ProductImage } from "@/components/shop/product-image";
import { formatBDT } from "@/lib/utils";

export const metadata: Metadata = { title: "Order · Admin" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/admin/orders" className="text-sm text-brand-600 hover:underline">
        ← Orders
      </Link>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{order.orderNumber}</h1>
          <p className="text-sm text-neutral-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={order.orderStatus} />
          <StatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <OrderStatusControl
          id={order.id}
          orderStatus={order.orderStatus}
          paymentStatus={order.paymentStatus}
        />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 text-sm">
          <p className="font-medium">Customer</p>
          <p className="mt-2 text-neutral-600">
            {order.customerName}
            <br />
            {order.customerEmail}
            <br />
            {order.customerPhone}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 text-sm">
          <p className="font-medium">Shipping address</p>
          <p className="mt-2 text-neutral-600">
            {order.address.fullName}, {order.address.phone}
            <br />
            {order.address.addressLine}, {order.address.city}, {order.address.district}
            {order.address.postalCode ? ` – ${order.address.postalCode}` : ""}
          </p>
        </div>
      </div>

      <ul className="mt-6 divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white px-5">
        {order.items.map((it) => (
          <li key={it.id} className="flex gap-3 py-4">
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
              <ProductImage src={it.image} alt={it.name} label={it.name} className="h-full w-full" />
            </div>
            <div className="flex-1 text-sm">
              <Link href={`/product/${it.slug}`} className="font-medium hover:text-brand-600">{it.name}</Link>
              <p className="text-neutral-500">{it.color} / {it.size} · Qty {it.quantity}</p>
            </div>
            <p className="text-sm font-semibold">{formatBDT(it.price * it.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 ml-auto max-w-xs space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>{order.shippingFee === 0 ? "Free" : formatBDT(order.shippingFee)}</span></div>
        {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatBDT(order.discount)}</span></div>}
        <div className="flex justify-between border-t border-neutral-200 pt-1 text-base font-semibold"><span>Total</span><span>{formatBDT(order.total)}</span></div>
      </div>
    </div>
  );
}
