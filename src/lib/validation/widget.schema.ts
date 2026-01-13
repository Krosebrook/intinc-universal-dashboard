/**
 * Widget Validation Schemas
 * Zod schemas for validating widget-related inputs
 */

import { z } from 'zod';

/**
 * Widget types
 */
const widgetTypeSchema = z.enum(['line', 'bar', 'area', 'pie', 'stacked-bar', 'composed']);

/**
 * Widget configuration schema
 */
export const widgetSchema = z.object({
  id: z.string().min(1),
  type: widgetTypeSchema,
  title: z.string()
    .min(1, 'Widget title is required')
    .max(100, 'Widget title must be less than 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  dataKey: z.union([z.string(), z.array(z.string())]),
  categoryKey: z.string(),
  gridSpan: z.number().min(1).max(12).optional().default(6),
  data: z.array(z.record(z.any())),
  forecast: z.boolean().optional(),
});

export type WidgetInput = z.infer<typeof widgetSchema>;

/**
 * Widget update schema (partial updates allowed)
 */
export const widgetUpdateSchema = widgetSchema.partial().required({ id: true });

export type WidgetUpdateInput = z.infer<typeof widgetUpdateSchema>;
