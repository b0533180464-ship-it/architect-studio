import { z } from 'zod';

// Enums
export const retainerTypeEnum = z.enum(['project_retainer', 'general_retainer', 'deposit', 'trust_account']);
export const retainerStatusEnum = z.enum(['pending', 'received', 'partially_applied', 'fully_applied', 'refunded']);

// Create retainer input
export const createRetainerSchema = z.object({
  clientId: z.string().cuid(),
  projectId: z.string().cuid().optional().nullable(),
  type: retainerTypeEnum,
  amount: z.number().positive('הסכום חייב להיות חיובי'),
  currency: z.string().default('ILS'),
  notes: z.string().optional(),
});

// Update retainer input
export const updateRetainerSchema = createRetainerSchema.partial().extend({
  id: z.string().cuid(),
});

// List retainers input
export const listRetainersSchema = z.object({
  clientId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  status: retainerStatusEnum.optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// Get/Delete by ID
export const retainerIdSchema = z.object({ id: z.string().cuid() });

// Receive retainer
export const receiveRetainerSchema = z.object({
  id: z.string().cuid(),
  paymentMethod: z.string().optional(),
  referenceNumber: z.string().optional(),
  receivedAt: z.string().optional(),
});

// Apply retainer
export const applyRetainerSchema = z.object({
  id: z.string().cuid(),
  amount: z.number().positive('הסכום חייב להיות חיובי'),
  paymentId: z.string().cuid().optional().nullable(),
  invoiceId: z.string().optional().nullable(),
  notes: z.string().optional(),
});

// Refund retainer
export const refundRetainerSchema = z.object({
  id: z.string().cuid(),
  amount: z.number().positive().optional(), // If not provided, refund remaining
  notes: z.string().optional(),
});

// Type exports
export type CreateRetainerInput = z.infer<typeof createRetainerSchema>;
export type UpdateRetainerInput = z.infer<typeof updateRetainerSchema>;
export type ListRetainersInput = z.infer<typeof listRetainersSchema>;
