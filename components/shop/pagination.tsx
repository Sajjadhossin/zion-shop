"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  const pathname = usePathname();
  const sp = useSearchParams();
  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams(sp.toString());
    if (p <= 1) params.delete("page");
    else params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav className="mt-12 flex items-center justify-center gap-1">
      {page > 1 && (
        <Link href={href(page - 1)} className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100">
          Prev
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          className={cn(
            "rounded-md px-3.5 py-2 text-sm",
            p === page
              ? "bg-brand-600 text-white"
              : "text-neutral-600 hover:bg-neutral-100"
          )}
        >
          {p}
        </Link>
      ))}
      {page < pageCount && (
        <Link href={href(page + 1)} className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100">
          Next
        </Link>
      )}
    </nav>
  );
}
