import { z } from 'zod';

const addressSchema = z.object({
  name: z.string().trim().min(1, 'Shipping name is required').max(100),
  phone: z.string().trim().min(5, 'Shipping phone is required').max(30).optional(),
  line1: z.string().trim().min(1, 'Shipping address line 1 is required').max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, 'Shipping city is required').max(100),
  state: z.string().trim().min(1, 'Shipping state is required').max(100),
  postalCode: z.string().trim().min(1, 'Shipping postal code is required').max(20),
  country: z.string().trim().length(2, 'Country must be a 2-letter ISO code'),
});

const paymentOptionSchema = z.enum(['stripe', 'cod']);

export const checkoutDTO = z.object({
  currency: z
    .string()
    .trim()
    .length(3, 'Currency must be a 3-letter ISO code')
    .transform((value) => value.toLowerCase())
    .default('usd'),
  paymentMethod: paymentOptionSchema.optional(),
  paymentProvider: paymentOptionSchema.optional(),
  shippingAddress: addressSchema.optional(),
}).transform((value) => ({
  ...value,
  paymentProvider: value.paymentMethod ?? value.paymentProvider ?? 'stripe',
}));
