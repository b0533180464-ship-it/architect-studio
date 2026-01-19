import { z } from 'zod';

// Enums
export const clientTypeEnum = z.enum(['individual', 'company']);
export const clientStatusEnum = z.enum(['lead', 'active', 'past', 'inactive']);
export const preferredCommunicationEnum = z.enum(['email', 'phone', 'whatsapp']);

// Important date schema
export const importantDateSchema = z.object({
  date: z.string(),
  description: z.string(),
  reminder: z.boolean(),
});

// Create client input
export const createClientSchema = z.object({
  name: z.string().min(1, 'שם הלקוח הוא שדה חובה').max(200),
  type: clientTypeEnum.default('individual'),

  // Contact
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  mobile: z.string().max(20).optional(),
  preferredCommunication: preferredCommunicationEnum.default('whatsapp'),
  bestTimeToContact: z.string().max(100).optional(),

  // Address
  address: z.string().optional(),
  city: z.string().max(100).optional(),

  // Company details (if type='company')
  companyNumber: z.string().max(50).optional(),
  contactPerson: z.string().max(200).optional(),

  // Status
  status: clientStatusEnum.default('lead'),
  leadSource: z.string().max(100).optional(),
  leadScore: z.number().int().min(0).max(100).optional(),

  // Preferences
  stylePreferences: z.array(z.string()).optional(),
  budgetRange: z.string().max(50).optional(),

  // Referral
  referredBy: z.string().max(200).optional(),
  referredByClientId: z.string().cuid().optional(),

  // Important dates
  anniversaryDate: z.string().optional(),
  importantDates: z.array(importantDateSchema).optional(),

  // Rating
  satisfactionRating: z.number().int().min(1).max(5).optional(),
  wouldRecommend: z.boolean().optional(),
  testimonial: z.string().optional(),

  // Notes
  notes: z.string().optional(),
});

// Update client input
export const updateClientSchema = createClientSchema.partial().extend({
  id: z.string().cuid(),
});

// List clients input (filters + pagination)
export const listClientsSchema = z.object({
  // Pagination
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),

  // Filters
  status: clientStatusEnum.optional(),
  type: clientTypeEnum.optional(),
  city: z.string().optional(),
  search: z.string().optional(),

  // Sorting
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Include inactive
  includeInactive: z.boolean().default(false),
});

// Get client by ID
export const getClientByIdSchema = z.object({
  id: z.string().cuid(),
  includeProjects: z.boolean().default(true),
});

// Delete client
export const deleteClientSchema = z.object({
  id: z.string().cuid(),
});

// Get client projects
export const getClientProjectsSchema = z.object({
  clientId: z.string().cuid(),
  includeArchived: z.boolean().default(false),
});

// Get client communications
export const getClientCommunicationsSchema = z.object({
  clientId: z.string().cuid(),
  type: z.enum(['email', 'phone', 'whatsapp', 'meeting', 'sms']).optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

// Type exports
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ListClientsInput = z.infer<typeof listClientsSchema>;
