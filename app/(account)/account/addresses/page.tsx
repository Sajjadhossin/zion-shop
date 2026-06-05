import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listAddresses } from "@/lib/queries/addresses";
import { AddressManager } from "@/components/account/address-manager";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const addresses = await listAddresses(user.id);

  return (
    <AddressManager
      addresses={addresses.map((a) => ({
        id: a.id,
        fullName: a.fullName,
        phone: a.phone,
        addressLine: a.addressLine,
        city: a.city,
        district: a.district,
        postalCode: a.postalCode,
        isDefault: a.isDefault,
      }))}
    />
  );
}
