import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserOrders } from "@/lib/queries/orders";
import { StatusBadge } from "@/components/account/status-badge";
import { formatBDT } from "@/lib/utils";

export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const orders = await getUserOrders(user.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">My Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-6 rounded-xl border border-neutral-200 p-10 text-center text-sm text-neutral-500">
          You haven’t placed any orders yet.{" "}
          <Link href="/products" className="text-brand-600 hover:underline">
            Browse products
          </Link>
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-100 rounded-xl border border-neutral-200">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <Link href={`/account/orders/${o.id}`} className="font-medium hover:text-brand-600">
                  {o.orderNumber}
                </Link>
                <p className="text-xs text-neutral-500">
                  {new Date(o.createdAt).toLocaleDateString()} · {o.itemCount} item
                  {o.itemCount !== 1 ? "s" : ""} · {o.paymentMethod}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.paymentStatus} />
                <StatusBadge status={o.orderStatus} />
                <span className="w-24 text-right text-sm font-semibold">
                  {formatBDT(o.total)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
