import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/account";
import { ProfileForm } from "@/components/account/profile-form";
import { PasswordForm } from "@/components/account/password-form";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfile(user.id);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

      <section className="mt-6">
        <ProfileForm
          initialName={profile?.name ?? ""}
          initialPhone={profile?.phone ?? ""}
          email={profile?.email ?? user.email ?? ""}
        />
      </section>

      <section className="mt-10 border-t border-neutral-200 pt-8">
        <h2 className="text-lg font-semibold">Change password</h2>
        <p className="mt-1 text-sm text-neutral-500">
          You’ll be signed in with the new password immediately.
        </p>
        <div className="mt-4">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
