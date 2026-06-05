import { cn } from "@/lib/utils";

const COLORS: Record<string, string> = {
  PLACED: "bg-blue-50 text-blue-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PACKED: "bg-amber-50 text-amber-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700",
  REFUNDED: "bg-neutral-100 text-neutral-600",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        COLORS[status] ?? "bg-neutral-100 text-neutral-600"
      )}
    >
      {status}
    </span>
  );
}
