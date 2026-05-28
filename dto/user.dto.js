import { z } from 'zod';

export const createAdminUserDTO = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().trim().email('Invalid email address'),
  password: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().min(6, 'Password must be at least 6 characters long').optional()
  ),
  roleId: z.string().uuid('Role id must be a valid UUID').nullable().optional(),
  isAdmin: z.boolean().optional().default(false),
});

export const updateAdminUserDTO = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long').optional(),
  email: z.string().trim().email('Invalid email address').optional(),
  password: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().min(6, 'Password must be at least 6 characters long').optional()
  ),
  roleId: z.string().uuid('Role id must be a valid UUID').nullable().optional(),
  isAdmin: z.boolean().optional(),
});
