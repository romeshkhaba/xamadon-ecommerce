import { z } from 'zod';

export const orderStatusEnum = z.enum([
  'pending',
  'paid',
  'confirmed',
  'shipped',
  'delivered',
  'fulfilled',
  'cancelled',
]);

export const paymentStatusEnum = z.enum([
  'pending',
  'succeeded',
  'failed',
  'cancelled',
]);

export const updateOrderStatusDTO = z.object({
  status: orderStatusEnum,
});

export const updatePaymentStatusDTO = z.object({
  paymentStatus: paymentStatusEnum,
});
