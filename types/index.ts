/**
 * Shared, app-wide TypeScript types.
 *
 * Domain types (Product, Order, etc.) will be re-exported from Prisma
 * starting in Phase 1. Keep this file thin — most types belong next to
 * the feature that owns them.
 */

export type Gender = "MEN" | "WOMEN" | "UNISEX" | "KIDS";

export type PaymentMethod = "BKASH" | "SSLCOMMERZ" | "COD";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type UserRole = "CUSTOMER" | "ADMIN";
