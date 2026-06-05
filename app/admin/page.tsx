import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserOrders } from "@/lib/queries/orders";
import { StatusBadge } from "@/components/account/status-badge";
import { formatBDT } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard · Admin" };

export default async function AdminDashboardPage() {
  const [products, orders, customers, revenueAgg, lowStock, recent] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { items: true } } },
      }),
    ]);

  const revenue = Number(revenueAgg._sum.total ?? 0);

  const cards = [
    { label: "Revenue (paid)", value: formatBDT(revenue) },
    { label: "Orders", value: orders },
    { label: "Products", value: products },
    { label: "Customers", value: customers },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      {lowStock > 0 && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {lowStock} variant{lowStock !== 1 ? "s" : ""} low on stock (≤ 5).{" "}
          <Link href="/admin/products" className="underline">Review products</Link>
        </p>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-brand-600">{o.orderNumber}</Link>
                  <span className="ml-2 text-xs text-neutral-400">{o._count.items} item{o._count.items !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.orderStatus} />
                  <span className="font-semibold">{formatBDT(Number(o.total))}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-neutral-400">Full analytics (charts, top products) arrive in the next pass.</p>
      </div>
    </div>
  );
}
