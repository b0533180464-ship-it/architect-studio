import { z } from 'zod';

// ============================================
// Input Schemas
// ============================================

export const listEntityTypesInput = z.object({
  includeInactive: z.boolean().optional().default(false),
});

export const getEntityTypeByIdInput = z.object({
  id: z.string().min(1),
});

export const getEntityTypeBySlugInput = z.object({
  slug: z.string().min(1),
});

export const createEntityTypeInput = z.object({
  name: z.string().min(1).max(100),
  namePlural: z.string().min(1).max(100),
  nameEn: z.string().max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  description: z.string().max(500).optional(),
  showInNav: z.boolean().optional().default(true),
  navParentId: z.string().optional(),
});

export const updateEntityTypeInput = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  namePlural: z.string().min(1).max(100).optional(),
  nameEn: z.string().max(100).optional().nullable(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  showInNav: z.boolean().optional(),
  navParentId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const deleteEntityTypeInput = z.object({
  id: z.string().min(1),
});

// ============================================
// Type Exports
// ============================================

export type ListEntityTypesInput = z.infer<typeof listEntityTypesInput>;
export type GetEntityTypeByIdInput = z.infer<typeof getEntityTypeByIdInput>;
export type GetEntityTypeBySlugInput = z.infer<typeof getEntityTypeBySlugInput>;
export type CreateEntityTypeInput = z.infer<typeof createEntityTypeInput>;
export type UpdateEntityTypeInput = z.infer<typeof updateEntityTypeInput>;
export type DeleteEntityTypeInput = z.infer<typeof deleteEntityTypeInput>;
