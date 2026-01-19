import { z } from 'zod';

// DeliveryTracking status enum
export const deliveryTrackingStatusEnum = z.enum([
  'ordered',
  'confirmed',
  'in_production',
  'ready_to_ship',
  'shipped',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'issue',
]);

// Issue type enum
export const deliveryIssueTypeEnum = z.enum([
  'delay',
  'damage',
  'wrong_item',
  'partial',
  'lost',
  'other',
]);

// Helper to transform empty string to undefined
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === '' ? undefined : val), schema.optional());

// List query
export const listDeliveryTrackingSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  purchaseOrderId: z.string().optional(),
  supplierId: z.string().optional(),
  roomProductId: z.string().optional(),
  projectId: z.string().optional(),
  status: emptyToUndefined(deliveryTrackingStatusEnum),
  hasIssue: z.boolean().optional(),
  isOverdue: z.boolean().optional(),
  sortBy: z.enum(['orderDate', 'estimatedDeliveryDate', 'status', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Get by ID
export const getDeliveryTrackingByIdSchema = z.object({
  id: z.string(),
});

// Create
export const createDeliveryTrackingSchema = z.object({
  purchaseOrderId: z.string().optional(),
  purchaseOrderItemId: z.string().optional(),
  roomProductId: z.string().optional(),
  supplierId: z.string(),
  vendorOrderNumber: z.string().optional(),
  orderDate: z.date(),
  estimatedShipDate: z.date().optional(),
  estimatedDeliveryDate: z.date().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  trackingUrl: z.string().optional(),
  originalLeadTimeDays: z.number().int().optional(),
  notes: z.string().optional(),
});

// Update
export const updateDeliveryTrackingSchema = z.object({
  id: z.string(),
  vendorOrderNumber: z.string().optional(),
  estimatedShipDate: z.date().optional().nullable(),
  actualShipDate: z.date().optional().nullable(),
  estimatedDeliveryDate: z.date().optional().nullable(),
  actualDeliveryDate: z.date().optional().nullable(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  trackingUrl: z.string().optional(),
  currentLeadTimeDays: z.number().int().optional(),
  delayDays: z.number().int().optional(),
  delayReason: z.string().optional(),
  notes: z.string().optional(),
});

// Delete
export const deleteDeliveryTrackingSchema = z.object({
  id: z.string(),
});

// Update status
export const updateDeliveryStatusSchema = z.object({
  id: z.string(),
  status: deliveryTrackingStatusEnum,
  location: z.string().optional(),
  note: z.string().optional(),
});

// Report issue
export const reportDeliveryIssueSchema = z.object({
  id: z.string(),
  issueType: deliveryIssueTypeEnum,
  issueDescription: z.string(),
});

// Resolve issue
export const resolveDeliveryIssueSchema = z.object({
  id: z.string(),
});
