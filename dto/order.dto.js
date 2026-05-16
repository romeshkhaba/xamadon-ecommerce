import { z } from "zod";
import { addressDTO } from "./address.dto.js";

const paymentMethodSchema = z.enum(["cod", "stripe"]);

export const checkoutDTO = z
  .object({
    addressId: z.string().uuid("A valid address id is required").optional(),
    shippingAddress: addressDTO.omit({ isDefault: true }).optional(),
    saveAddress: z.boolean().optional().default(false),
    currency: z
      .string()
      .trim()
      .length(3, "Currency must be a 3-letter code")
      .transform((value) => value.toLowerCase())
      .default("usd"),
    paymentMethod: paymentMethodSchema.default("cod"),
  })
  .refine((value) => value.addressId || value.shippingAddress, {
    message: "Select an address or provide a shipping address",
  });

export const previewOrderDTO = z
  .object({
    addressId: z.string().uuid("A valid address id is required").optional(),
    shippingAddress: addressDTO.omit({ isDefault: true }).optional(),
    currency: z
      .string()
      .trim()
      .length(3, "Currency must be a 3-letter code")
      .transform((value) => value.toLowerCase())
      .default("usd"),
  })
  .refine((value) => value.addressId || value.shippingAddress, {
    message: "Select an address or provide a shipping address",
  });

export const updateOrderStatusDTO = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
});

export const updatePaymentStatusDTO = z.object({
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded", "cancelled"]),
});

export const adminUpdateOrderDTO = z
  .object({
    status: z
      .enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
      .optional(),
    paymentStatus: z
      .enum(["pending", "paid", "failed", "refunded", "cancelled"])
      .optional(),
  })
  .refine((value) => value.status || value.paymentStatus, {
    message: "Order status or payment status is required",
  });

export const stripeCheckoutPaymentStatusDTO = z
  .object({
    sessionId: z.string().trim().min(1, "Checkout session id is required").optional(),
    session_id: z.string().trim().min(1, "Checkout session id is required").optional(),
  })
  .refine((value) => value.sessionId || value.session_id, {
    message: "Checkout session id is required",
  });
