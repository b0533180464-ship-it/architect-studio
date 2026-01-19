import { z } from 'zod';

// ============================================
// Navigation Item Schemas
// ============================================

// Base navigation item schema (for output)
export const navigationItemSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  label: z.string(),
  labelEn: z.string().nullable(),
  icon: z.string().nullable(),
  href: z.string().nullable(),
  entityType: z.string().nullable(),
  parentId: z.string().nullable(),
  order: z.number(),
  isVisible: z.boolean(),
  isCollapsed: z.boolean(),
  isSystem: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Navigation item with children (recursive)
export type NavigationItemWithChildren = z.infer<typeof navigationItemSchema> & {
  children?: NavigationItemWithChildren[];
};

// List schema - no input needed, get all for tenant
export const listNavigationSchema = z.object({
  includeHidden: z.boolean().optional().default(false),
});

// Get by ID
export const getNavigationByIdSchema = z.object({
  id: z.string(),
});

// Create navigation item
export const createNavigationItemSchema = z.object({
  label: z.string().min(1, 'שם הפריט נדרש'),
  labelEn: z.string().optional(),
  icon: z.string().optional(),
  href: z.string().optional(),
  entityType: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().optional(),
  isVisible: z.boolean().optional().default(true),
  isCollapsed: z.boolean().optional().default(false),
});

// Update navigation item
export const updateNavigationItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1).optional(),
  labelEn: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  href: z.string().nullable().optional(),
  entityType: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  isVisible: z.boolean().optional(),
  isCollapsed: z.boolean().optional(),
});

// Delete navigation item
export const deleteNavigationItemSchema = z.object({
  id: z.string(),
});

// Reorder navigation items
export const reorderNavigationSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    order: z.number(),
    parentId: z.string().nullable(),
  })),
});

// Toggle visibility
export const toggleVisibilitySchema = z.object({
  id: z.string(),
  isVisible: z.boolean(),
});

// Toggle collapse
export const toggleCollapseSchema = z.object({
  id: z.string(),
  isCollapsed: z.boolean(),
});

// Types for exports
export type ListNavigationInput = z.infer<typeof listNavigationSchema>;
export type GetNavigationByIdInput = z.infer<typeof getNavigationByIdSchema>;
export type CreateNavigationItemInput = z.infer<typeof createNavigationItemSchema>;
export type UpdateNavigationItemInput = z.infer<typeof updateNavigationItemSchema>;
export type DeleteNavigationItemInput = z.infer<typeof deleteNavigationItemSchema>;
export type ReorderNavigationInput = z.infer<typeof reorderNavigationSchema>;
export type ToggleVisibilityInput = z.infer<typeof toggleVisibilitySchema>;
export type ToggleCollapseInput = z.infer<typeof toggleCollapseSchema>;
