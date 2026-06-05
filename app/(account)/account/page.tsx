import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware guarantees a logged-in user here, but guard defensively.
  const profile = user
    ? await prisma.user.findUnique({ where: { id: user.id } })
    : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">My Account</h1>
        <SignOutButton />
      </div>

      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-neutral-500">Name</dt>
            <dd className="mt-1 font-medium">{profile?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-500">Email</dt>
            <dd className="mt-1 font-medium">{profile?.email ?? user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-500">Account type</dt>
            <dd className="mt-1 font-medium capitalize">
              {(profile?.role ?? "customer").toLowerCase()}
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-8 text-sm text-neutral-400">
        Orders, addresses, and wishlist arrive in Phase 5.
      </p>
    </main>
  );
}
