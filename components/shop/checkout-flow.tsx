"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { cartSubtotal, useCart } from "@/lib/stores/cart";
import { applyCoupon, placeOrder } from "@/app/actions/checkout";
import { DISTRICTS, shippingFee } from "@/lib/shipping";
import { ProductImage } from "./product-image";
import { cn, formatBDT } from "@/lib/utils";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  postalCode: string | null;
  isDefault: boolean;
};

type NewAddress = {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  postalCode: string;
};

const EMPTY_ADDRESS: NewAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  district: "Dhaka",
  postalCode: "",
};

const STEPS = ["Address", "Review", "Payment"];

export function CheckoutFlow({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const { items, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"saved" | "new">(
    addresses.length ? "saved" : "new"
  );
  const [selectedId, setSelectedId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ""
  );
  const [newAddress, setNewAddress] = useState<NewAddress>(EMPTY_ADDRESS);

  const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponPending, startCoupon] = useTransition();

  const [method, setMethod] = useState<"COD">("COD");
  const [placing, startPlacing] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const subtotal = mounted ? cartSubtotal(items) : 0;

  const district =
    mode === "saved"
      ? addresses.find((a) => a.id === selectedId)?.district ?? ""
      : newAddress.district;
  const shipping = mounted ? shippingFee(district || "Dhaka", subtotal) : 0;
  const discount = applied?.discount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const addressValid = useMemo(() => {
    if (mode === "saved") return !!selectedId;
    const n = newAddress;
    return (
      n.fullName.trim().length >= 2 &&
      n.phone.trim().length >= 6 &&
      n.addressLine.trim().length >= 4 &&
      n.city.trim().length >= 2 &&
      n.district.trim().length >= 2
    );
  }, [mode, selectedId, newAddress]);

  function onApplyCoupon() {
    setCouponMsg(null);
    const code = couponInput.trim();
    if (!code) return;
    startCoupon(async () => {
      const res = await applyCoupon(code, subtotal);
      if (res.ok) {
        setApplied({ code: res.code, discount: res.discount });
        setCouponMsg(`Applied ${res.code}: −${formatBDT(res.discount)}`);
      } else {
        setApplied(null);
        setCouponMsg(res.error);
      }
    });
  }

  function onPlaceOrder() {
    setError(null);
    startPlacing(async () => {
      const res = await placeOrder({
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        addressId: mode === "saved" ? selectedId : undefined,
        newAddress:
          mode === "new"
            ? { ...newAddress, postalCode: newAddress.postalCode || undefined }
            : undefined,
        couponCode: applied?.code,
        paymentMethod: method,
      });
      if (res.ok) {
        clear();
        router.push(`/order/${res.orderId}/success`);
      } else {
        setError(res.error);
      }
    });
  }

  if (!mounted) return <div className="mx-auto max-w-5xl px-4 py-16" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-2 text-neutral-500">Your cart is empty.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const setNA = (k: keyof NewAddress, v: string) =>
    setNewAddress((s) => ({ ...s, [k]: v }));

  const inputCls =
    "h-10 w-full rounded-md border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                i < step
                  ? "bg-brand-600 text-white"
                  : i === step
                    ? "bg-brand-600 text-white"
                    : "bg-neutral-200 text-neutral-500"
              )}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </span>
            <span
              className={cn(
                "text-sm",
                i === step ? "font-medium text-neutral-900" : "text-neutral-500"
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-2 h-px w-8 bg-neutral-200" />}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          {/* STEP 1: ADDRESS */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Shipping address</h2>

              {addresses.length > 0 && (
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => setMode("saved")}
                    className={cn(
                      "rounded-full border px-4 py-1.5",
                      mode === "saved"
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-neutral-300"
                    )}
                  >
                    Saved
                  </button>
                  <button
                    onClick={() => setMode("new")}
                    className={cn(
                      "rounded-full border px-4 py-1.5",
                      mode === "new"
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-neutral-300"
                    )}
                  >
                    New address
                  </button>
                </div>
              )}

              {mode === "saved" ? (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-lg border p-4",
                        selectedId === a.id
                          ? "border-brand-600 ring-1 ring-brand-600"
                          : "border-neutral-200"
                      )}
                    >
                      <input
                        type="radio"
                        name="addr"
                        checked={selectedId === a.id}
                        onChange={() => setSelectedId(a.id)}
                        className="mt-1 accent-brand-600"
                      />
                      <div className="text-sm">
                        <p className="font-medium">
                          {a.fullName}{" "}
                          {a.isDefault && (
                            <span className="ml-1 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase text-neutral-500">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="text-neutral-600">{a.phone}</p>
                        <p className="text-neutral-600">
                          {a.addressLine}, {a.city}, {a.district}
                          {a.postalCode ? ` – ${a.postalCode}` : ""}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input className={inputCls} placeholder="Full name" value={newAddress.fullName} onChange={(e) => setNA("fullName", e.target.value)} />
                  <input className={inputCls} placeholder="Phone" value={newAddress.phone} onChange={(e) => setNA("phone", e.target.value)} />
                  <input className={cn(inputCls, "sm:col-span-2")} placeholder="Address line (house, road, area)" value={newAddress.addressLine} onChange={(e) => setNA("addressLine", e.target.value)} />
                  <input className={inputCls} placeholder="City / Thana" value={newAddress.city} onChange={(e) => setNA("city", e.target.value)} />
                  <select className={inputCls} value={newAddress.district} onChange={(e) => setNA("district", e.target.value)}>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <input className={inputCls} placeholder="Postal code (optional)" value={newAddress.postalCode} onChange={(e) => setNA("postalCode", e.target.value)} />
                </div>
              )}

              <button
                onClick={() => setStep(1)}
                disabled={!addressValid}
                className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Continue to review
              </button>
            </div>
          )}

          {/* STEP 2: REVIEW */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Review your order</h2>
              <ul className="divide-y divide-neutral-100">
                {items.map((i) => (
                  <li key={i.variantId} className="flex gap-3 py-4">
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                      <ProductImage src={i.image} alt={i.name} label={i.name} className="h-full w-full" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{i.name}</p>
                      <p className="text-neutral-500">{i.color} / {i.size} · Qty {i.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatBDT(i.price * i.quantity)}</p>
                  </li>
                ))}
              </ul>

              <div>
                <label className="text-sm font-medium">Coupon code</label>
                <div className="mt-2 flex gap-2">
                  <input className={inputCls} placeholder="e.g. EID2026" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
                  <button onClick={onApplyCoupon} disabled={couponPending} className="shrink-0 rounded-md bg-neutral-900 px-4 text-sm text-white hover:bg-neutral-800 disabled:opacity-50">
                    {couponPending ? "…" : "Apply"}
                  </button>
                </div>
                {couponMsg && (
                  <p className={cn("mt-2 text-xs", applied ? "text-green-600" : "text-red-600")}>{couponMsg}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="rounded-md border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:border-neutral-400">Back</button>
                <button onClick={() => setStep(2)} className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700">Continue to payment</button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Payment method</h2>
              <div className="space-y-3">
                <label className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-4", method === "COD" ? "border-brand-600 ring-1 ring-brand-600" : "border-neutral-200")}>
                  <input type="radio" name="pay" checked readOnly className="accent-brand-600" />
                  <div className="text-sm">
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-neutral-500">Pay in cash when your order arrives.</p>
                  </div>
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 opacity-60">
                  <input type="radio" name="pay" disabled className="accent-neutral-400" />
                  <div className="text-sm">
                    <p className="font-medium">bKash</p>
                    <p className="text-neutral-400">Coming soon — add merchant credentials to enable.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 opacity-60">
                  <input type="radio" name="pay" disabled className="accent-neutral-400" />
                  <div className="text-sm">
                    <p className="font-medium">SSLCommerz (Card / Nagad / Rocket)</p>
                    <p className="text-neutral-400">Coming soon — add sandbox credentials to enable.</p>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="rounded-md border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:border-neutral-400">Back</button>
                <button onClick={onPlaceOrder} disabled={placing} className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
                  {placing ? "Placing order…" : `Place order · ${formatBDT(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold">Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span>{formatBDT(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatBDT(shipping)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({applied?.code})</span>
                <span>−{formatBDT(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatBDT(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
