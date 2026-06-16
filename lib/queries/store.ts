import "server-only";
import { prisma } from "@/lib/prisma";

export type StoreSettings = {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  contactEmail: string;
  contactPhone: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
};

const DEFAULTS: StoreSettings = {
  storeName: "Zion Shop",
  logoUrl: null,
  primaryColor: null,
  secondaryColor: null,
  contactEmail: "hello@zionshop.com",
  contactPhone: null,
  facebookUrl: null,
  instagramUrl: null,
};

/**
 * White-label store branding/contact. Falls back to Zion Shop defaults.
 *
 * This runs in the root layout (via BrandStyle) and the site header/footer, so
 * it executes on every page — including build-time prerenders of /_not-found
 * and static pages. A transient DB issue (e.g. the Supabase pooler timing out
 * during `next build`, P2024) must never crash the render, so we degrade to
 * defaults instead of throwing.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const s = await prisma.storeSettings.findFirst();
    if (!s) return DEFAULTS;
    return {
      storeName: s.storeName ?? DEFAULTS.storeName,
      logoUrl: s.logoUrl ?? null,
      primaryColor: s.primaryColor ?? null,
      secondaryColor: s.secondaryColor ?? null,
      contactEmail: s.contactEmail ?? DEFAULTS.contactEmail,
      contactPhone: s.contactPhone ?? null,
      facebookUrl: s.facebookUrl ?? null,
      instagramUrl: s.instagramUrl ?? null,
    };
  } catch (err) {
    console.error("getStoreSettings: falling back to defaults —", err);
    return DEFAULTS;
  }
}
