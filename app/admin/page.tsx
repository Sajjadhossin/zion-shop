import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdminAnalytics } from "@/lib/queries/admin";
import { BarChart } from "@/components/admin/bar-chart";
import { StatusBadge } from "@/components/account/status-badge";
import { formatBDT } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard · Admin" };

export default async function AdminDashboardPage() {
  const [analytics, products, customers, ordersTotal, revenueAgg, lowStock, recent] =
    await Promise.all([
      getAdminAnalytics(),
      prisma.product.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
      prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

  const totalRevenue = Number(revenueAgg._sum.total ?? 0);
  const monthRevenue = analytics.revenueSeries.reduce((s, d) => s + d.revenue, 0);
  const statusPeak = Math.max(1, ...analytics.statusDistribution.map((s) => s.count));

  const today = [
    { label: "Today’s revenue", value: formatBDT(analytics.todayRevenue) },
    { label: "Today’s orders", value: analytics.todayOrders },
    { label: "New customers today", value: analytics.newCustomers },
  ];
  const totals = [
    { label: "Revenue (paid)", value: formatBDT(totalRevenue) },
    { label: "Orders", value: ordersTotal },
    { label: "Products", value: products },
    { label: "Customers", value: customers },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {today.map((c) => (
          <div key={c.label} className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      {lowStock > 0 && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {lowStock} variant{lowStock !== 1 ? "s" : ""} low on stock (≤ 5).{" "}
          <Link href="/admin/products" className="underline">Review products</Link>
        </p>
      )}

      {/* Revenue chart */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Revenue · last 30 days</h2>
          <span className="text-sm text-neutral-500">{formatBDT(monthRevenue)} total</span>
        </div>
        <div className="mt-4">
          <BarChart data={analytics.revenueSeries.map((d) => ({ label: d.label, value: d.revenue }))} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top products */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Top selling products</h2>
          {analytics.topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No sales yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {analytics.topProducts.map((p) => (
                <li key={p.slug} className="flex items-center justify-between text-sm">
                  <Link href={`/product/${p.slug}`} className="hover:text-brand-600">{p.name}</Link>
                  <span className="font-medium text-neutral-500">{p.qty} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Order status distribution */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Order status</h2>
          {analytics.statusDistribution.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No orders yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {analytics.statusDistribution.map((s) => (
                <li key={s.status} className="text-sm">
                  <div className="mb-1 flex justify-between">
                    <span className="text-neutral-600">{s.status}</span>
                    <span className="font-medium">{s.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100">
                    <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(s.count / statusPeak) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div>
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
                  <span className="ml-2 text-xs text-neutral-400">{o.user.name ?? o.user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.orderStatus} />
                  <span className="font-semibold">{formatBDT(Number(o.total))}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {totals.map((c) => (
          <div key={c.label} className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-500">{c.label}</p>
            <p className="mt-1 text-lg font-semibold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
