import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Admin panel layout: /admin, /admin/products, /admin/orders, etc.
 *
 * Middleware already blocks unauthenticated users. Here we do the
 * authorization step — only role = ADMIN may enter; everyone else is sent home.
 * (Done here, not in middleware, because Prisma can't run on the Edge runtime.)
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (dbUser?.role !== "ADMIN") redirect("/");

  return <>{children}</>;
}
