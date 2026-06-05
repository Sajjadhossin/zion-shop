import type { Metadata } from "next";
import { getStoreSettingsRow } from "@/lib/queries/admin";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Settings · Admin" };

export default async function AdminSettingsPage() {
  const settings = await getStoreSettingsRow();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Store settings</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
