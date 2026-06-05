import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserReviews } from "@/lib/queries/account";
import { StarRating } from "@/components/shop/star-rating";

export const metadata: Metadata = { title: "My Reviews" };

export default async function ReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const reviews = await getUserReviews(user.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">My Reviews</h1>

      {reviews.length === 0 ? (
        <p className="mt-6 rounded-xl border border-neutral-200 p-10 text-center text-sm text-neutral-500">
          You haven’t written any reviews yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center justify-between">
                <Link href={`/product/${r.productSlug}`} className="font-medium hover:text-brand-600">
                  {r.productName}
                </Link>
                <span className="text-xs text-neutral-400">
                  {new Date(r.date).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2">
                <StarRating value={r.rating} size={14} />
              </div>
              {r.comment && (
                <p className="mt-2 text-sm text-neutral-600">{r.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
