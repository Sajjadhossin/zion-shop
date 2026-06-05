import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listAddresses } from "@/lib/queries/addresses";
import { CheckoutFlow } from "@/components/shop/checkout-flow";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/checkout");

  const addresses = await listAddresses(user.id);

  return (
    <CheckoutFlow
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
