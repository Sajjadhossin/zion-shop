import type { Metadata } from "next";
import { getAdminReviews } from "@/lib/queries/admin";
import { ReviewsTable } from "@/components/admin/reviews-table";

export const metadata: Metadata = { title: "Reviews · Admin" };

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();
  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
          <p className="text-sm text-neutral-500">
            Verified-purchase feedback (private — not shown on the storefront).
          </p>
        </div>
        {avg && (
          <div className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-center">
            <p className="text-2xl font-semibold">{avg}</p>
            <p className="text-xs text-neutral-500">avg · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>
      <ReviewsTable reviews={reviews} />
    </div>
  );
}
