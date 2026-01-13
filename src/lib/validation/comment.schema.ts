/**
 * Comment Validation Schemas
 * Zod schemas for validating comment-related inputs
 */

import { z } from 'zod';

/**
 * Comment schema for creation
 */
export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Comment content is required')
    .max(1000, 'Comment must be less than 1000 characters')
    .trim(),
  dashboardId: z.string().min(1, 'Dashboard ID is required'),
  widgetId: z.string().optional(),
  parentId: z.string().optional(), // For nested comments/replies
});

export type CommentInput = z.infer<typeof commentSchema>;

/**
 * Comment ID validation
 */
export const commentIdSchema = z.string().min(1, 'Comment ID is required');
