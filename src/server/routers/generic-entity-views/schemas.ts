import { z } from 'zod';

// Sort order
export const sortOrderEnum = z.enum(['asc', 'desc']);

// Column configuration
export const columnConfigSchema = z.object({
  fieldKey: z.string(),
  width: z.number().int().positive().optional(),
  visible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// Filter operators
export const filterOperatorEnum = z.enum([
  'equals', 'not_equals', 'contains', 'not_contains',
  'starts_with', 'ends_with', 'greater_than', 'less_than',
  'greater_or_equal', 'less_or_equal', 'is_empty', 'is_not_empty',
]);

// Filter configuration
export const filterConfigSchema = z.object({
  fieldKey: z.string(),
  operator: filterOperatorEnum,
  value: z.any(),
});

// List views by entity type slug
export const listViewsSchema = z.object({
  entityTypeSlug: z.string().min(1),
  includeShared: z.boolean().default(true),
});

// Get view by ID
export const getViewByIdSchema = z.object({
  id: z.string().cuid(),
});

// Create view
export const createViewSchema = z.object({
  entityTypeSlug: z.string().min(1),
  name: z.string().min(1, 'שם התצוגה הוא חובה').max(100),
  isDefault: z.boolean().default(false),
  isShared: z.boolean().default(false),
  columns: z.array(columnConfigSchema),
  sortBy: z.string().optional(),
  sortOrder: sortOrderEnum.optional(),
  filters: z.array(filterConfigSchema).optional(),
});

// Update view
export const updateViewSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  isDefault: z.boolean().optional(),
  isShared: z.boolean().optional(),
  columns: z.array(columnConfigSchema).optional(),
  sortBy: z.string().optional().nullable(),
  sortOrder: sortOrderEnum.optional().nullable(),
  filters: z.array(filterConfigSchema).optional().nullable(),
});

// Delete view
export const deleteViewSchema = z.object({
  id: z.string().cuid(),
});

// Duplicate view
export const duplicateViewSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100),
});

// Set default view
export const setDefaultViewSchema = z.object({
  entityTypeSlug: z.string().min(1),
  viewId: z.string().cuid().nullable(),
});

// Type exports
export type ColumnConfig = z.infer<typeof columnConfigSchema>;
export type FilterConfig = z.infer<typeof filterConfigSchema>;
