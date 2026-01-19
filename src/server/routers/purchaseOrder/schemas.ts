import { z } from 'zod';

// PurchaseOrder status enum
export const purchaseOrderStatusEnum = z.enum([
  'draft',
  'pending_approval',
  'sent',
  'confirmed',
  'in_production',
  'partial',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
]);

// Helper to transform empty string to undefined
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === '' ? undefined : val), schema.optional());

// List query
export const listPurchaseOrdersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  projectId: z.string().optional(),
  supplierId: z.string().optional(),
  status: emptyToUndefined(purchaseOrderStatusEnum),
  search: z.string().optional(),
  sortBy: z.enum(['orderDate', 'total', 'orderNumber', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Get by ID
export const getPurchaseOrderByIdSchema = z.object({
  id: z.string(),
});

// Create
export const createPurchaseOrderSchema = z.object({
  projectId: z.string(),
  supplierId: z.string(),
  expectedDelivery: z.date().optional(),
  paymentTerms: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  discount: z.number().min(0).optional(),
  shippingCost: z.number().min(0).optional(),
  vatRate: z.number().min(0).optional(),
  currency: z.string().optional(),
});

// Update
export const updatePurchaseOrderSchema = z.object({
  id: z.string(),
  vendorOrderNumber: z.string().optional(),
  expectedDelivery: z.date().optional().nullable(),
  actualDelivery: z.date().optional().nullable(),
  paymentTerms: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  discount: z.number().min(0).optional(),
  shippingCost: z.number().min(0).optional(),
});

// Delete
export const deletePurchaseOrderSchema = z.object({
  id: z.string(),
});

// Update status
export const updateStatusSchema = z.object({
  id: z.string(),
  status: purchaseOrderStatusEnum,
});

// Approve
export const approvePurchaseOrderSchema = z.object({
  id: z.string(),
});

// Add item
export const addItemSchema = z.object({
  purchaseOrderId: z.string(),
  productId: z.string().optional(),
  roomProductId: z.string().optional(),
  roomId: z.string().optional(),
  description: z.string(),
  sku: z.string().optional(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  notes: z.string().optional(),
});

// Update item
export const updateItemSchema = z.object({
  id: z.string(),
  purchaseOrderId: z.string(),
  description: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.number().int().min(1).optional(),
  unitPrice: z.number().min(0).optional(),
  deliveredQuantity: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

// Delete item
export const deleteItemSchema = z.object({
  id: z.string(),
  purchaseOrderId: z.string(),
});

// Reorder items
export const reorderItemsSchema = z.object({
  purchaseOrderId: z.string(),
  itemIds: z.array(z.string()),
});
