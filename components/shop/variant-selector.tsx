"use client";

import { useMemo, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { colorToHex, isLightColor } from "@/lib/colors";
import { cn, formatBDT } from "@/lib/utils";

type Variant = {
  id: string;
  size: string;
  color: string;
  stock: number;
  price: number | null;
};

const SIZE_ORDER: Record<string, number> = { XS: 0, S: 1, M: 2, L: 3, XL: 4, XXL: 5 };

export function VariantSelector({
  variants,
  basePrice,
}: {
  variants: Variant[];
  basePrice: number;
}) {
  const colors = useMemo(
    () => [...new Set(variants.map((v) => v.color))],
    [variants]
  );
  const sizes = useMemo(
    () =>
      [...new Set(variants.map((v) => v.size))].sort(
        (a, b) => (SIZE_ORDER[a] ?? 99) - (SIZE_ORDER[b] ?? 99)
      ),
    [variants]
  );

  const [color, setColor] = useState(colors[0] ?? "");
  const [size, setSize] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const selected = variants.find((v) => v.color === color && v.size === size);
  const stockFor = (s: string) =>
    variants.find((v) => v.color === color && v.size === s)?.stock ?? 0;
  const price = selected?.price ?? basePrice;

  function addToCart() {
    if (!selected) {
      setMessage("Please choose a size first.");
      return;
    }
    // Cart + checkout are built in Phase 3. For now, confirm the selection.
    setMessage(
      `Selected ${color} / ${size} — cart & checkout arrive in Phase 3.`
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-2xl font-semibold">{formatBDT(price)}</p>

      {/* Color */}
      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700">
          Color: <span className="text-neutral-500">{color}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setSize("");
                setMessage(null);
              }}
              title={c}
              aria-label={c}
              className={cn(
                "h-8 w-8 rounded-full ring-offset-2 transition",
                isLightColor(c) && "border border-neutral-300",
                color === c && "ring-2 ring-brand-600"
              )}
              style={{ backgroundColor: colorToHex(c) }}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700">Size</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const stock = stockFor(s);
            const disabled = stock <= 0;
            return (
              <button
                key={s}
                disabled={disabled}
                onClick={() => {
                  setSize(s);
                  setMessage(null);
                }}
                className={cn(
                  "flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm",
                  disabled && "cursor-not-allowed border-neutral-200 text-neutral-300 line-through",
                  !disabled && size === s
                    ? "border-brand-600 bg-brand-600 text-white"
                    : !disabled && "border-neutral-300 text-neutral-800 hover:border-neutral-400"
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
        {selected && (
          <p className="mt-2 text-xs text-neutral-500">
            {selected.stock > 0
              ? selected.stock <= 5
                ? `Only ${selected.stock} left in stock`
                : "In stock"
              : "Out of stock"}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={addToCart}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-brand-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <ShoppingBag size={18} /> Add to Cart
        </button>
        <button
          onClick={() =>
            setMessage("Wishlist is wired up in Phase 3.")
          }
          aria-label="Add to wishlist"
          className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-4 text-neutral-700 hover:border-neutral-400"
        >
          <Heart size={18} />
        </button>
      </div>

      {message && (
        <p className="rounded-md bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
          {message}
        </p>
      )}
    </div>
  );
}
