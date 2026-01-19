import { z } from 'zod';

// Dimension unit enum
export const dimensionUnitSchema = z.enum(['cm', 'in', 'mm']);

// Create product input
export const createProductSchema = z.object({
  name: z.string().min(1, 'שם המוצר הוא שדה חובה').max(255),
  sku: z.string().max(100).optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),

  // Supplier
  supplierId: z.string().optional(),
  supplierSku: z.string().max(100).optional(),

  // Prices
  costPrice: z.number().min(0).optional(),
  retailPrice: z.number().min(0).optional(),
  currency: z.string().length(3).default('ILS'),

  // Dimensions
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  depth: z.number().min(0).optional(),
  unit: dimensionUnitSchema.default('cm'),

  // Lead time
  leadTimeDays: z.number().int().min(0).optional(),

  // Media
  imageUrl: z.string().url().optional().or(z.literal('')),
  images: z.array(z.string().url()).default([]),
  productUrl: z.string().url().optional().or(z.literal('')),
  specSheetUrl: z.string().url().optional().or(z.literal('')),

  // Tags
  tags: z.array(z.string()).default([]),
});

// Update product input
export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().cuid(),
});

// List products input (filters + pagination)
export const listProductsSchema = z.object({
  // Pagination
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),

  // Filters
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  hasImage: z.boolean().optional(),
  search: z.string().optional(),

  // Sorting
  sortBy: z.enum(['name', 'costPrice', 'createdAt', 'usageCount']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  // Include inactive
  includeInactive: z.boolean().default(false),
});

// Get product by ID
export const getProductByIdSchema = z.object({
  id: z.string().cuid(),
});

// Delete product
export const deleteProductSchema = z.object({
  id: z.string().cuid(),
});

// Duplicate product
export const duplicateProductSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).optional(),
});

// Add product to room
export const addProductToRoomSchema = z.object({
  productId: z.string().cuid(),
  projectId: z.string().cuid(),
  roomId: z.string().cuid(),
  quantity: z.number().int().min(1).default(1),
  costPrice: z.number().min(0).optional(),
  clientPrice: z.number().min(0).optional(),
  markupPercent: z.number().min(0).max(1000).optional(),
  notes: z.string().optional(),
});

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsInput = z.infer<typeof listProductsSchema>;
export type AddProductToRoomInput = z.infer<typeof addProductToRoomSchema>;
