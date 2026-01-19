import { z } from 'zod';

// Enums
export const proposalStatusEnum = z.enum([
  'draft', 'sent', 'viewed', 'approved', 'rejected', 'expired', 'revised',
]);
export const discountTypeEnum = z.enum(['percent', 'fixed']);

// Proposal section schema
export const proposalSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  order: z.number().int(),
});

// Create proposal input
export const createProposalSchema = z.object({
  projectId: z.string().cuid().optional().nullable(),
  clientId: z.string().cuid(),
  title: z.string().min(1, 'כותרת ההצעה היא שדה חובה').max(255),
  introduction: z.string().optional(),
  scope: z.string().optional(),
  sections: z.array(proposalSectionSchema).optional(),
  exclusions: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
  terms: z.string().optional(),
  discountAmount: z.number().min(0).optional(),
  discountType: discountTypeEnum.optional(),
  discountReason: z.string().optional(),
  vatRate: z.number().min(0).max(100).default(17),
  validUntil: z.string().optional(),
  requiresSignature: z.boolean().default(false),
});

// Update proposal input
export const updateProposalSchema = createProposalSchema.partial().extend({
  id: z.string().cuid(),
});

// List proposals input
export const listProposalsSchema = z.object({
  projectId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional(),
  status: proposalStatusEnum.optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// Get by ID / Delete / Actions
export const proposalIdSchema = z.object({ id: z.string().cuid() });

// Send proposal
export const sendProposalSchema = z.object({
  id: z.string().cuid(),
  emailTo: z.string().email().optional(),
  message: z.string().optional(),
});

// Approve/Reject (public)
export const publicProposalActionSchema = z.object({
  token: z.string(),
  feedback: z.string().optional(),
});

// New version
export const newVersionSchema = z.object({
  id: z.string().cuid(),
});

// Duplicate
export const duplicateProposalSchema = z.object({
  id: z.string().cuid(),
  title: z.string().optional(),
});

// Type exports
export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;
export type ListProposalsInput = z.infer<typeof listProposalsSchema>;
