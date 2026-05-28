import { z } from 'zod';

const roleModuleFields = {
  roleId: z.string().uuid('Role id must be a valid UUID').optional().nullable(),
  permissionId: z.string().uuid('Permission id must be a valid UUID').optional().nullable(),
  name: z
    .string()
    .trim()
    .min(1, 'Module name is required')
    .max(100, 'Module name is too long')
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, 'Module name has invalid characters')
    .optional(),
  read: z.boolean().optional().default(true),
  write: z.boolean().optional().default(false),
  delete: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
};

export const createRoleModuleDTO = z.object(roleModuleFields).refine(
  (value) => value.name || value.permissionId,
  {
    message: 'Module name or permission id is required',
  }
);

export const updateRoleModuleDTO = z
  .object({
    ...roleModuleFields,
    isActive: z.boolean().optional(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one module field must be provided',
  });
