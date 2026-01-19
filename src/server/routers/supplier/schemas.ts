import { z } from 'zod';

// Create supplier input
export const createSupplierSchema = z.object({
  name: z.string().min(1, 'שם הספק הוא שדה חובה').max(200),
  categoryId: z.string().optional(),

  // Contact
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  website: z.string().url('כתובת אתר לא תקינה').optional().or(z.literal('')),
  contactPerson: z.string().max(200).optional(),

  // Address
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  companyNumber: z.string().max(50).optional(),

  // Commercial terms
  paymentTerms: z.string().max(100).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  creditDays: z.number().int().min(0).optional(),
  minimumOrder: z.number().min(0).optional(),

  // Trade Account
  hasTradeAccount: z.boolean().default(false),
  tradeAccountNumber: z.string().max(50).optional(),
  tradeDiscountPercent: z.number().min(0).max(100).optional(),

  // Rating
  rating: z.number().int().min(1).max(5).optional(),
  reliabilityScore: z.number().int().min(0).max(100).optional(),

  // Notes
  notes: z.string().optional(),
});

// Update supplier input
export const updateSupplierSchema = createSupplierSchema.partial().extend({
  id: z.string().cuid(),
});

// List suppliers input (filters + pagination)
export const listSuppliersSchema = z.object({
  // Pagination
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),

  // Filters
  categoryId: z.string().optional(),
  city: z.string().optional(),
  hasTradeAccount: z.boolean().optional(),
  search: z.string().optional(),

  // Sorting
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'rating']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  // Include inactive
  includeInactive: z.boolean().default(false),
});

// Get supplier by ID
export const getSupplierByIdSchema = z.object({
  id: z.string().cuid(),
});

// Delete supplier
export const deleteSupplierSchema = z.object({
  id: z.string().cuid(),
});

// Type exports
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type ListSuppliersInput = z.infer<typeof listSuppliersSchema>;
