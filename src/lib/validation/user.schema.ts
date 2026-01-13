/**
 * User Validation Schemas
 * Zod schemas for validating user-related inputs
 */

import { z } from 'zod';

/**
 * Email validation
 */
export const emailSchema = z.string()
  .email('Invalid email address')
  .min(5, 'Email is too short')
  .max(254, 'Email is too long')
  .toLowerCase()
  .trim();

/**
 * User role validation
 */
export const roleSchema = z.enum(['owner', 'admin', 'editor', 'viewer', 'guest']);

/**
 * Workspace member invitation schema
 */
export const workspaceMemberSchema = z.object({
  email: emailSchema,
  role: roleSchema,
  workspaceId: z.string().min(1, 'Workspace ID is required'),
});

export type WorkspaceMemberInput = z.infer<typeof workspaceMemberSchema>;

/**
 * User profile update schema
 */
export const userProfileSchema = z.object({
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters')
    .trim()
    .optional(),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
