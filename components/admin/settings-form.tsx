"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStoreSettings } from "@/app/actions/admin/settings";

type Settings = {
  storeName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  whatsappNumber: string;
};

const inputCls =
  "h-10 w-full rounded-md border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof Settings, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  function save() {
    setMsg(null);
    setError(null);
    start(async () => {
      const res = await updateStoreSettings(form);
      if (res.ok) {
        setMsg("Settings saved.");
        router.refresh();
      } else setError(res.error);
    });
  }

  function Field({ label, k, placeholder }: { label: string; k: keyof Settings; placeholder?: string }) {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium">{label}</label>
        <input className={inputCls} value={form[k]} placeholder={placeholder} onChange={(e) => set(k, e.target.value)} />
      </div>
    );
  }

  function ColorField({ label, k }: { label: string; k: keyof Settings }) {
    const val = form[k] || "#000000";
    return (
      <div>
        <label className="mb-1 block text-sm font-medium">{label}</label>
        <div className="flex items-center gap-2">
          <input type="color" value={/^#/.test(form[k]) ? form[k] : val} onChange={(e) => set(k, e.target.value)} className="h-10 w-12 rounded border border-neutral-300" />
          <input className={inputCls} value={form[k]} placeholder="#c2410c" onChange={(e) => set(k, e.target.value)} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Branding</h2>
        <Field label="Store name" k="storeName" placeholder="Zion Shop" />
        <Field label="Logo URL" k="logoUrl" placeholder="https://…" />
        <div className="grid grid-cols-2 gap-4">
          <ColorField label="Primary color" k="primaryColor" />
          <ColorField label="Secondary color" k="secondaryColor" />
        </div>
        <p className="text-xs text-neutral-400">
          Store name & logo show across the storefront immediately. Brand colors are saved here;
          wiring them into the live theme is a small follow-up step.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Contact</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Contact email" k="contactEmail" />
          <Field label="Contact phone" k="contactPhone" />
        </div>
        <Field label="Address" k="address" />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Social</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Facebook URL" k="facebookUrl" />
          <Field label="Instagram URL" k="instagramUrl" />
          <Field label="WhatsApp number" k="whatsappNumber" />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-green-600">{msg}</p>}

      <button onClick={save} disabled={pending} className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
        {pending ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}
