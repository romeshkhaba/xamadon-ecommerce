import { z } from 'zod';

const permissionFields = {
  name: z
    .string()
    .trim()
    .min(1, 'Permission name is required')
    .max(100, 'Permission name is too long')
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, 'Permission name has invalid characters'),
  read: z.boolean().optional().default(true),
  write: z.boolean().optional().default(false),
  delete: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
};

export const createPermissionDTO = z.object(permissionFields);

export const updatePermissionDTO = z
  .object({
    ...permissionFields,
    isActive: z.boolean().optional(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one permission field must be provided',
  });
