import { z } from 'zod';

// Entity types enum
export const configurableEntityTypeEnum = z.enum([
  'project_type',
  'project_status',
  'project_phase',
  'task_status',
  'task_category',
  'room_type',
  'room_status',
  'supplier_category',
  'trade',
  'document_category',
  'expense_category',
]);

export type ConfigurableEntityType = z.infer<typeof configurableEntityTypeEnum>;

// List entities input
export const listConfigSchema = z.object({
  entityType: configurableEntityTypeEnum,
  activeOnly: z.boolean().default(true),
});

// Get by ID input
export const getConfigByIdSchema = z.object({
  id: z.string().cuid(),
});

// Create entity input
export const createConfigSchema = z.object({
  entityType: configurableEntityTypeEnum,
  code: z.string().max(50).optional(),
  name: z.string().min(1, 'שם הוא שדה חובה').max(100),
  nameEn: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'צבע לא תקין').optional(),
  icon: z.string().max(50).optional(),
  metadata: z.any().optional(),
  isDefault: z.boolean().default(false),
  isFinal: z.boolean().default(false),
  allowedTransitions: z.array(z.string().cuid()).default([]),
  order: z.number().int().nonnegative().optional(),
});

// Update entity input
export const updateConfigSchema = z.object({
  id: z.string().cuid(),
  code: z.string().max(50).optional().nullable(),
  name: z.string().min(1).max(100).optional(),
  nameEn: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  metadata: z.any().optional().nullable(),
  isDefault: z.boolean().optional(),
  isFinal: z.boolean().optional(),
  allowedTransitions: z.array(z.string().cuid()).optional(),
  isActive: z.boolean().optional(),
});

// Delete entity input
export const deleteConfigSchema = z.object({
  id: z.string().cuid(),
});

// Reorder entities input
export const reorderConfigSchema = z.object({
  entityType: configurableEntityTypeEnum,
  ids: z.array(z.string().cuid()).min(1),
});

// Reset to defaults input
export const resetConfigSchema = z.object({
  entityType: configurableEntityTypeEnum,
});

// Type exports
export type ListConfigInput = z.infer<typeof listConfigSchema>;
export type CreateConfigInput = z.infer<typeof createConfigSchema>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
