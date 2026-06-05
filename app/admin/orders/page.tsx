import type { Metadata } from "next";
import { getAdminOrders } from "@/lib/queries/admin";
import { OrdersTable } from "@/components/admin/orders-table";

export const metadata: Metadata = { title: "Orders · Admin" };

type SP = Record<string, string | string[] | undefined>;
const one = (sp: SP, k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const orders = await getAdminOrders({
    status: one(sp, "status"),
    method: one(sp, "method"),
    q: one(sp, "q"),
  });
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Orders</h1>
      <OrdersTable orders={orders} />
    </div>
  );
}
