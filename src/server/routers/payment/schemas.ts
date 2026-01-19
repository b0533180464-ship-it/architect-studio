import { z } from 'zod';

// Enums
export const paymentTypeEnum = z.enum(['retainer', 'milestone', 'scheduled', 'final', 'change_order', 'hourly', 'expense']);
export const paymentStatusEnum = z.enum(['scheduled', 'pending', 'invoiced', 'partial', 'paid', 'overdue', 'cancelled']);
export const paymentTriggerTypeEnum = z.enum(['date', 'phase', 'event']);

// Create payment input
export const createPaymentSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(1, 'שם התשלום הוא שדה חובה').max(255),
  description: z.string().optional(),
  amount: z.number().positive('הסכום חייב להיות חיובי'),
  currency: z.string().default('ILS'),
  paymentType: paymentTypeEnum,
  milestonePhaseId: z.string().cuid().optional().nullable(),
  milestoneDescription: z.string().optional(),
  percentageOfBudget: z.number().min(0).max(100).optional(),
  hoursWorked: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  changeOrderId: z.string().cuid().optional().nullable(),
  dueDate: z.string().optional(),
  triggerType: paymentTriggerTypeEnum.optional(),
  triggerDescription: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

// Update payment input
export const updatePaymentSchema = createPaymentSchema.partial().extend({
  id: z.string().cuid(),
});

// List payments input
export const listPaymentsSchema = z.object({
  projectId: z.string().cuid().optional(),
  status: paymentStatusEnum.optional(),
  paymentType: paymentTypeEnum.optional(),
  overdue: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// Get/Delete by ID
export const paymentIdSchema = z.object({ id: z.string().cuid() });

// Mark as paid
export const markPaidSchema = z.object({
  id: z.string().cuid(),
  paidAmount: z.number().positive().optional(), // If not provided, use full amount
  paidDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  referenceNumber: z.string().optional(),
});

// Partial payment
export const partialPaymentSchema = z.object({
  id: z.string().cuid(),
  amount: z.number().positive('הסכום חייב להיות חיובי'),
  paidDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  referenceNumber: z.string().optional(),
});

// Send reminder
export const sendReminderSchema = z.object({
  id: z.string().cuid(),
  message: z.string().optional(),
});

// Type exports
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type ListPaymentsInput = z.infer<typeof listPaymentsSchema>;
