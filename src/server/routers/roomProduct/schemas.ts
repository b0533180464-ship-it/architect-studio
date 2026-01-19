import { z } from 'zod';

// Client approval status enum
export const clientApprovalStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'revision_requested',
]);

// Procurement status enum
export const procurementStatusSchema = z.enum([
  'not_ordered',
  'quoted',
  'ordered',
  'in_production',
  'shipped',
  'delivered',
  'installed',
  'issue',
]);

// Product issue type enum
export const productIssueTypeSchema = z.enum([
  'damage',
  'wrong_item',
  'missing',
  'defect',
  'delay',
  'other',
]);

// Create room product input
export const createRoomProductSchema = z.object({
  projectId: z.string().cuid(),
  roomId: z.string().cuid(),
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).default(1),
  costPrice: z.number().min(0),
  retailPrice: z.number().min(0).optional(),
  clientPrice: z.number().min(0),
  markupPercent: z.number().min(0).max(1000).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  installationRequired: z.boolean().default(false),
});

// Update room product input
export const updateRoomProductSchema = z.object({
  id: z.string().cuid(),
  quantity: z.number().int().min(1).optional(),
  costPrice: z.number().min(0).optional(),
  retailPrice: z.number().min(0).optional(),
  clientPrice: z.number().min(0).optional(),
  markupPercent: z.number().min(0).max(1000).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  installationRequired: z.boolean().optional(),
});

// List room products input
export const listRoomProductsSchema = z.object({
  projectId: z.string().cuid(),
  roomId: z.string().cuid().optional(),

  // Pagination
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),

  // Filters
  clientApprovalStatus: clientApprovalStatusSchema.optional(),
  procurementStatus: procurementStatusSchema.optional(),
  hasIssue: z.boolean().optional(),
  supplierId: z.string().optional(),

  // Sorting
  sortBy: z.enum(['order', 'createdAt', 'clientPrice', 'productName']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Get room product by ID
export const getRoomProductByIdSchema = z.object({
  id: z.string().cuid(),
});

// Delete room product
export const deleteRoomProductSchema = z.object({
  id: z.string().cuid(),
});

// Update approval status
export const updateApprovalStatusSchema = z.object({
  id: z.string().cuid(),
  status: clientApprovalStatusSchema,
  feedback: z.string().optional(),
});

// Bulk update approval status
export const bulkUpdateApprovalSchema = z.object({
  ids: z.array(z.string().cuid()).min(1),
  status: clientApprovalStatusSchema,
});

// Update procurement status
export const updateProcurementStatusSchema = z.object({
  id: z.string().cuid(),
  status: procurementStatusSchema,
  vendorOrderNumber: z.string().optional(),
  estimatedDeliveryDate: z.date().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

// Update delivery info
export const updateDeliverySchema = z.object({
  id: z.string().cuid(),
  estimatedDeliveryDate: z.date().optional(),
  actualDeliveryDate: z.date().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

// Mark as installed
export const markInstalledSchema = z.object({
  id: z.string().cuid(),
  installedBy: z.string().optional(),
});

// Report issue
export const reportIssueSchema = z.object({
  id: z.string().cuid(),
  issueType: productIssueTypeSchema,
  issueDescription: z.string().min(1, 'תיאור הבעיה הוא שדה חובה'),
});

// Resolve issue
export const resolveIssueSchema = z.object({
  id: z.string().cuid(),
});

// Reorder products
export const reorderProductsSchema = z.object({
  roomId: z.string().cuid(),
  productIds: z.array(z.string().cuid()),
});

// FF&E Schedule filters
export const ffeScheduleSchema = z.object({
  projectId: z.string().cuid(),
  roomId: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  clientApprovalStatus: clientApprovalStatusSchema.optional(),
  procurementStatus: procurementStatusSchema.optional(),
  hasIssue: z.boolean().optional(),
});

// Type exports
export type CreateRoomProductInput = z.infer<typeof createRoomProductSchema>;
export type UpdateRoomProductInput = z.infer<typeof updateRoomProductSchema>;
export type ListRoomProductsInput = z.infer<typeof listRoomProductsSchema>;
export type UpdateApprovalStatusInput = z.infer<typeof updateApprovalStatusSchema>;
export type UpdateProcurementStatusInput = z.infer<typeof updateProcurementStatusSchema>;
export type ReportIssueInput = z.infer<typeof reportIssueSchema>;
export type FFEScheduleInput = z.infer<typeof ffeScheduleSchema>;
