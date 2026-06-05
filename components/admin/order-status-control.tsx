"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateOrderStatus,
  updatePaymentStatus,
} from "@/app/actions/admin/orders";

const ORDER = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAY = ["PENDING", "PAID", "FAILED", "REFUNDED"];

const selectCls =
  "h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60";

export function OrderStatusControl({
  id,
  orderStatus,
  paymentStatus,
}: {
  id: string;
  orderStatus: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-4">
      <label className="text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Order status</span>
        <select
          className={selectCls}
          value={orderStatus}
          disabled={pending}
          onChange={(e) =>
            start(async () => {
              await updateOrderStatus(id, e.target.value);
              router.refresh();
            })
          }
        >
          {ORDER.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Payment status</span>
        <select
          className={selectCls}
          value={paymentStatus}
          disabled={pending}
          onChange={(e) =>
            start(async () => {
              await updatePaymentStatus(id, e.target.value);
              router.refresh();
            })
          }
        >
          {PAY.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
