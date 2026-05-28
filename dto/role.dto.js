import { z } from 'zod';

const roleFields = {
  name: z.string().trim().min(1, 'Role name is required').max(100, 'Role name is too long'),
  isActive: z.boolean().optional().default(true),
};

export const createRoleDTO = z.object({
  ...roleFields,
  permissionIds: z.array(z.string().uuid('Each permission id must be a valid UUID')).optional(),
});

export const updateRoleDTO = z
  .object({
    ...roleFields,
    isActive: z.boolean().optional(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one role field must be provided',
  });

export const assignUserRoleDTO = z.object({
  roleId: z.string().uuid('Role id must be a valid UUID').nullable(),
});
