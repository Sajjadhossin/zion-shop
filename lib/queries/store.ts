import "server-only";
import { prisma } from "@/lib/prisma";

/** White-label store branding/contact. Falls back to Zion Shop defaults. */
export async function getStoreSettings() {
  const s = await prisma.storeSettings.findFirst();
  return {
    storeName: s?.storeName ?? "Zion Shop",
    logoUrl: s?.logoUrl ?? null,
    contactEmail: s?.contactEmail ?? "hello@zionshop.com",
    contactPhone: s?.contactPhone ?? null,
    facebookUrl: s?.facebookUrl ?? null,
    instagramUrl: s?.instagramUrl ?? null,
  };
}
