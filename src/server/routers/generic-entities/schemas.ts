import { z } from 'zod';

// ============================================
// Input Schemas
// ============================================

export const listEntitiesInput = z.object({
  entityTypeId: z.string().min(1),
  includeInactive: z.boolean().optional().default(false),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

export const getEntityByIdInput = z.object({
  id: z.string().min(1),
});

export const createEntityInput = z.object({
  entityTypeId: z.string().min(1),
  name: z.string().min(1).max(200),
  data: z.record(z.unknown()).optional().default({}),
});

export const updateEntityInput = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  data: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

export const deleteEntityInput = z.object({
  id: z.string().min(1),
});

export const bulkUpdateInput = z.object({
  updates: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(200).optional(),
    data: z.record(z.unknown()).optional(),
  })),
});

// ============================================
// Type Exports
// ============================================

export type ListEntitiesInput = z.infer<typeof listEntitiesInput>;
export type GetEntityByIdInput = z.infer<typeof getEntityByIdInput>;
export type CreateEntityInput = z.infer<typeof createEntityInput>;
export type UpdateEntityInput = z.infer<typeof updateEntityInput>;
export type DeleteEntityInput = z.infer<typeof deleteEntityInput>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateInput>;
