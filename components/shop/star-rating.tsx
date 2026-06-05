import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  count,
  size = 16,
}: {
  value: number;
  count?: number;
  size?: number;
}) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={cn(
              i <= rounded
                ? "fill-amber-400 text-amber-400"
                : "fill-neutral-200 text-neutral-200"
            )}
          />
        ))}
      </div>
      {count != null && (
        <span className="text-xs text-neutral-500">
          {count > 0 ? `${value.toFixed(1)} (${count})` : "No reviews yet"}
        </span>
      )}
    </div>
  );
}
