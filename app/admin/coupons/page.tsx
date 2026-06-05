import type { Metadata } from "next";
import { getAdminCoupons } from "@/lib/queries/admin";
import { CouponManager } from "@/components/admin/coupon-manager";

export const metadata: Metadata = { title: "Coupons · Admin" };

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();
  return <CouponManager coupons={coupons} />;
}
