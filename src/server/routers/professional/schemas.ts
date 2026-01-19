import { z } from 'zod';

// Create professional input
export const createProfessionalSchema = z.object({
  name: z.string().min(1, 'שם בעל המקצוע הוא שדה חובה').max(200),
  companyName: z.string().max(200).optional(),
  tradeId: z.string().min(1, 'מקצוע הוא שדה חובה'),

  // Contact
  phone: z.string().min(1, 'טלפון הוא שדה חובה').max(20),
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),

  // License
  licenseNumber: z.string().max(50).optional(),
  insuranceExpiry: z.string().optional(), // Date string

  // Rating
  rating: z.number().int().min(1).max(5).optional(),

  // Notes & specialties
  notes: z.string().optional(),
  specialties: z.array(z.string()).optional(),
});

// Update professional input
export const updateProfessionalSchema = createProfessionalSchema.partial().extend({
  id: z.string().cuid(),
});

// List professionals input (filters + pagination)
export const listProfessionalsSchema = z.object({
  // Pagination
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),

  // Filters
  tradeId: z.string().optional(),
  search: z.string().optional(),

  // Sorting
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'rating']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  // Include inactive
  includeInactive: z.boolean().default(false),
});

// Get professional by ID
export const getProfessionalByIdSchema = z.object({
  id: z.string().cuid(),
});

// Delete professional
export const deleteProfessionalSchema = z.object({
  id: z.string().cuid(),
});

// Type exports
export type CreateProfessionalInput = z.infer<typeof createProfessionalSchema>;
export type UpdateProfessionalInput = z.infer<typeof updateProfessionalSchema>;
export type ListProfessionalsInput = z.infer<typeof listProfessionalsSchema>;
