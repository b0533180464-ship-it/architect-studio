import { z } from 'zod';

// Enums
export const contractStatusEnum = z.enum([
  'draft', 'sent', 'pending_signature', 'partially_signed', 'signed', 'cancelled', 'terminated',
]);

// Signature schema
export const contractSignatureSchema = z.object({
  id: z.string(),
  party: z.enum(['designer', 'client']),
  name: z.string(),
  email: z.string().email(),
  title: z.string().optional(),
  signedAt: z.string().optional(),
  signatureUrl: z.string().optional(),
  ipAddress: z.string().optional(),
});

// Create contract input
export const createContractSchema = z.object({
  projectId: z.string().cuid(),
  clientId: z.string().cuid(),
  title: z.string().min(1, 'כותרת החוזה היא שדה חובה').max(255),
  templateId: z.string().cuid().optional().nullable(),
  content: z.string().min(1, 'תוכן החוזה הוא שדה חובה'),
  proposalId: z.string().cuid().optional().nullable(),
  totalValue: z.number().min(0),
  startDate: z.string(),
  endDate: z.string().optional(),
});

// Update contract input
export const updateContractSchema = createContractSchema.partial().extend({
  id: z.string().cuid(),
});

// List contracts input
export const listContractsSchema = z.object({
  projectId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional(),
  status: contractStatusEnum.optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// Get/Delete by ID
export const contractIdSchema = z.object({ id: z.string().cuid() });

// Sign contract
export const signContractSchema = z.object({
  id: z.string().cuid(),
  party: z.enum(['designer', 'client']),
  name: z.string(),
  email: z.string().email(),
  title: z.string().optional(),
  signatureUrl: z.string().optional(),
});

// Create from proposal
export const createFromProposalSchema = z.object({
  proposalId: z.string().cuid(),
  templateId: z.string().cuid().optional(),
  content: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
});

// Type exports
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type ListContractsInput = z.infer<typeof listContractsSchema>;
