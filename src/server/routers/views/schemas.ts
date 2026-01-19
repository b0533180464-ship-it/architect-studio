import { z } from 'zod';

// Supported entity types for views
export const viewEntityTypeEnum = z.enum([
  'projects',
  'clients',
  'tasks',
  'suppliers',
  'professionals',
  'products',
  'rooms',
  'documents',
  'meetings',
  'proposals',
  'contracts',
  'payments',
  'expenses',
]);

export type ViewEntityType = z.infer<typeof viewEntityTypeEnum>;

// View types
export const viewTypeEnum = z.enum(['table', 'kanban', 'calendar']);
export type ViewType = z.infer<typeof viewTypeEnum>;

// Sort order
export const sortOrderEnum = z.enum(['asc', 'desc']);

// Column configuration
const columnConfigSchema = z.object({
  fieldKey: z.string(),
  width: z.number().int().positive().optional(),
  visible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// Filter operators
export const filterOperatorEnum = z.enum([
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'starts_with',
  'ends_with',
  'greater_than',
  'less_than',
  'greater_or_equal',
  'less_or_equal',
  'between',
  'in',
  'not_in',
  'is_empty',
  'is_not_empty',
  'is_today',
  'is_this_week',
  'is_this_month',
  'is_overdue',
]);

// Filter configuration
const filterConfigSchema = z.object({
  fieldKey: z.string(),
  operator: filterOperatorEnum,
  value: z.any(),
});

// List views
export const listViewsSchema = z.object({
  entityType: viewEntityTypeEnum,
  includeShared: z.boolean().default(true),
});

// Get view by ID
export const getViewByIdSchema = z.object({
  id: z.string().cuid(),
});

// Create view
export const createViewSchema = z.object({
  entityType: viewEntityTypeEnum,
  name: z.string().min(1, 'שם התצוגה הוא חובה').max(100),
  viewType: viewTypeEnum.default('table'),
  isDefault: z.boolean().default(false),
  isShared: z.boolean().default(false),
  columns: z.array(columnConfigSchema),
  sortBy: z.string().optional(),
  sortOrder: sortOrderEnum.optional(),
  filters: z.array(filterConfigSchema).optional(),
  groupBy: z.string().optional(),
});

// Update view
export const updateViewSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  viewType: viewTypeEnum.optional(),
  isDefault: z.boolean().optional(),
  isShared: z.boolean().optional(),
  columns: z.array(columnConfigSchema).optional(),
  sortBy: z.string().optional().nullable(),
  sortOrder: sortOrderEnum.optional().nullable(),
  filters: z.array(filterConfigSchema).optional().nullable(),
  groupBy: z.string().optional().nullable(),
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
  entityType: viewEntityTypeEnum,
  viewId: z.string().cuid().nullable(), // null to clear default
});

// Type exports
export type ListViewsInput = z.infer<typeof listViewsSchema>;
export type CreateViewInput = z.infer<typeof createViewSchema>;
export type UpdateViewInput = z.infer<typeof updateViewSchema>;
export type ColumnConfig = z.infer<typeof columnConfigSchema>;
export type FilterConfig = z.infer<typeof filterConfigSchema>;
