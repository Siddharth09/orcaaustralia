import type { OrderStatus, ProductCategory, Size } from "@prisma/client";

export const SIZE_ORDER: Size[] = ["S", "M", "L", "XL", "XXL"];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  SHORTS: "Swim Shorts",
  BOXER_BRIEF: "Tencel Modal Boxer Briefs",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Processing",
  PAID: "Processing",
  FULFILLED: "Shipped",
  CANCELLED: "Cancelled",
};

export const FLAT_SHIPPING_CENTS = 900;
export const FREE_SHIPPING_THRESHOLD_CENTS = 15000;
