import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  phone: z.string().min(6, "Enter a valid phone number"),
  addressLine: z.string().min(4, "Address is too short"),
  city: z.string().min(2, "Enter a city/area"),
  district: z.string().min(2, "Select a district"),
  postalCode: z.string().optional().or(z.literal("")),
  isDefault: z.boolean().optional(),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  addressId: z.string().optional(),
  newAddress: addressSchema.optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["COD", "BKASH", "SSLCOMMERZ"]),
});
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export type CouponResult =
  | { ok: true; code: string; discount: number }
  | { ok: false; error: string };

export type PlaceOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export type ActionResult = { ok: true } | { ok: false; error: string };
