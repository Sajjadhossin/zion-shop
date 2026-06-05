import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [products, orders, customers] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const stats = [
    { label: "Products", value: products },
    { label: "Orders", value: orders },
    { label: "Customers", value: customers },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Zion Shop control panel.
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-neutral-200 bg-white p-6"
          >
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-neutral-400">
        Product, order, and settings management arrive in Phase 6.
      </p>
    </main>
  );
}
