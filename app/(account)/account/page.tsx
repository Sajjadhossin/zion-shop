import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAccountCounts, getProfile } from "@/lib/queries/account";
import { getUserOrders } from "@/lib/queries/orders";
import { StatusBadge } from "@/components/account/status-badge";
import { formatBDT } from "@/lib/utils";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, counts, orders] = await Promise.all([
    getProfile(user.id),
    getAccountCounts(user.id),
    getUserOrders(user.id),
  ]);
  const recent = orders.slice(0, 3);

  const cards = [
    { label: "Orders", value: counts.orders, href: "/account/orders" },
    { label: "Wishlist", value: counts.wishlist, href: "/account/wishlist" },
    { label: "Addresses", value: counts.addresses, href: "/account/addresses" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">{profile?.email}</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-neutral-200 p-5 transition hover:border-brand-300"
          >
            <p className="text-2xl font-semibold">{c.value}</p>
            <p className="text-sm text-neutral-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent orders</h2>
        {orders.length > 0 && (
          <Link href="/account/orders" className="flex items-center gap-1 text-sm text-brand-600 hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <p className="mt-4 rounded-xl border border-neutral-200 p-8 text-center text-sm text-neutral-500">
          No orders yet.{" "}
          <Link href="/products" className="text-brand-600 hover:underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-100 rounded-xl border border-neutral-200">
          {recent.map((o) => (
            <li key={o.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <Link href={`/account/orders/${o.id}`} className="font-medium hover:text-brand-600">
                  {o.orderNumber}
                </Link>
                <p className="text-xs text-neutral-500">
                  {new Date(o.createdAt).toLocaleDateString()} · {o.itemCount} item
                  {o.itemCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.orderStatus} />
                <span className="text-sm font-semibold">{formatBDT(o.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
