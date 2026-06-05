import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";

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

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-60 shrink-0 flex-col bg-neutral-950 px-4 py-6 md:flex">
        <Link href="/admin" className="px-3 text-lg font-semibold text-white">
          Zion Admin
        </Link>
        <div className="mt-8 flex-1">
          <AdminNav />
        </div>
        <div className="space-y-2 px-1">
          <Link href="/" className="block px-3 text-xs text-neutral-400 hover:text-white">
            ← Back to store
          </Link>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3 md:hidden">
          <Link href="/admin" className="font-semibold">Zion Admin</Link>
          <SignOutButton />
        </header>
        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
