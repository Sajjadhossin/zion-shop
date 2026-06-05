import type { Metadata } from "next";
import { getAdminCustomers } from "@/lib/queries/admin";
import { CustomersTable } from "@/components/admin/customers-table";

export const metadata: Metadata = { title: "Customers · Admin" };

type SP = Record<string, string | string[] | undefined>;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const customers = await getAdminCustomers(q);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Customers</h1>
      <CustomersTable customers={customers} />
    </div>
  );
}
