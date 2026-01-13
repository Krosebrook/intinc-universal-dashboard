/**
 * Dashboard Validation Schemas
 * Zod schemas for validating dashboard-related inputs
 */

import { z } from 'zod';

/**
 * Dashboard schema for creation and updates
 */
export const dashboardSchema = z.object({
  name: z.string()
    .min(1, 'Dashboard name is required')
    .max(100, 'Dashboard name must be less than 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  department: z.enum(['Sales', 'HR', 'IT', 'Marketing']),
  widgets: z.array(z.any()).optional(),
  isPublic: z.boolean().optional().default(false),
  workspaceId: z.string().optional(),
});

export type DashboardInput = z.infer<typeof dashboardSchema>;

/**
 * Dashboard ID validation
 */
export const dashboardIdSchema = z.string().min(1, 'Dashboard ID is required');
