"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { colorToHex, isLightColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

const GENDERS = [
  { label: "All", value: "" },
  { label: "Men", value: "MEN" },
  { label: "Women", value: "WOMEN" },
  { label: "Unisex", value: "UNISEX" },
];

export function FilterSidebar({
  facets,
}: {
  facets: { sizes: string[]; colors: string[] };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function push(params: URLSearchParams) {
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }
  function setParam(key: string, value?: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    push(params);
  }
  function toggleMulti(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    const cur = new Set((params.get(key)?.split(",") ?? []).filter(Boolean));
    if (cur.has(value)) cur.delete(value);
    else cur.add(value);
    if (cur.size) params.set(key, [...cur].join(","));
    else params.delete(key);
    push(params);
  }

  const gender = sp.get("gender") ?? "";
  const sizes = new Set((sp.get("sizes")?.split(",") ?? []).filter(Boolean));
  const colors = new Set((sp.get("colors")?.split(",") ?? []).filter(Boolean));
  const FILTER_KEYS = ["gender", "sizes", "colors", "minPrice", "maxPrice"];
  const hasFilters = FILTER_KEYS.some((k) => sp.get(k));

  return (
    <aside className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
          Filters
        </h2>
        {hasFilters && (
          <button
            onClick={() => {
              const params = new URLSearchParams(sp.toString());
              FILTER_KEYS.forEach((k) => params.delete(k));
              push(params);
            }}
            className="text-xs text-brand-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Gender
        </p>
        <div className="space-y-1.5">
          {GENDERS.map((g) => (
            <label key={g.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="gender"
                checked={gender === g.value}
                onChange={() => setParam("gender", g.value || undefined)}
                className="accent-brand-600"
              />
              {g.label}
            </label>
          ))}
        </div>
      </div>

      {facets.sizes.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Size
          </p>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((s) => (
              <button
                key={s}
                onClick={() => toggleMulti("sizes", s)}
                className={cn(
                  "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm",
                  sizes.has(s)
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-neutral-400"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {facets.colors.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Color
          </p>
          <div className="flex flex-wrap gap-2">
            {facets.colors.map((c) => (
              <button
                key={c}
                onClick={() => toggleMulti("colors", c)}
                title={c}
                aria-label={c}
                className={cn(
                  "h-7 w-7 rounded-full ring-offset-2 transition",
                  isLightColor(c) && "border border-neutral-300",
                  colors.has(c) && "ring-2 ring-brand-600"
                )}
                style={{ backgroundColor: colorToHex(c) }}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Price (৳)
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const min = (form.elements.namedItem("minPrice") as HTMLInputElement).value;
            const max = (form.elements.namedItem("maxPrice") as HTMLInputElement).value;
            const params = new URLSearchParams(sp.toString());
            if (min) params.set("minPrice", min);
            else params.delete("minPrice");
            if (max) params.set("maxPrice", max);
            else params.delete("maxPrice");
            push(params);
          }}
          className="flex items-center gap-2"
        >
          <input
            name="minPrice"
            type="number"
            min={0}
            placeholder="Min"
            defaultValue={sp.get("minPrice") ?? ""}
            className="h-9 w-full rounded-md border border-neutral-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <span className="text-neutral-400">–</span>
          <input
            name="maxPrice"
            type="number"
            min={0}
            placeholder="Max"
            defaultValue={sp.get("maxPrice") ?? ""}
            className="h-9 w-full rounded-md border border-neutral-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="h-9 shrink-0 rounded-md bg-neutral-900 px-3 text-sm text-white hover:bg-neutral-800"
          >
            Go
          </button>
        </form>
      </div>
    </aside>
  );
}
