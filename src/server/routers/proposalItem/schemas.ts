import { z } from 'zod';

// Enums
export const proposalItemTypeEnum = z.enum(['service', 'product', 'expense']);

// Create item input
export const createProposalItemSchema = z.object({
  proposalId: z.string().cuid(),
  type: proposalItemTypeEnum,
  name: z.string().min(1, 'שם הפריט הוא שדה חובה').max(255),
  description: z.string().optional(),
  quantity: z.number().positive().default(1),
  unit: z.string().optional(),
  unitPrice: z.number().min(0),
  productId: z.string().cuid().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isOptional: z.boolean().default(false),
  isSelected: z.boolean().default(true),
  groupName: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

// Update item input
export const updateProposalItemSchema = createProposalItemSchema.partial().extend({
  id: z.string().cuid(),
});

// Get/Delete item
export const proposalItemIdSchema = z.object({
  id: z.string().cuid(),
});

// List items for a proposal
export const listProposalItemsSchema = z.object({
  proposalId: z.string().cuid(),
});

// Reorder items
export const reorderProposalItemsSchema = z.object({
  proposalId: z.string().cuid(),
  items: z.array(z.object({
    id: z.string().cuid(),
    order: z.number().int().min(0),
  })),
});

// Toggle selection
export const toggleSelectionSchema = z.object({
  id: z.string().cuid(),
  isSelected: z.boolean(),
});

// Type exports
export type CreateProposalItemInput = z.infer<typeof createProposalItemSchema>;
export type UpdateProposalItemInput = z.infer<typeof updateProposalItemSchema>;
