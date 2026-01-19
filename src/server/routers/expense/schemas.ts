import { z } from 'zod';

// Enums
export const expenseStatusEnum = z.enum(['pending', 'approved', 'rejected', 'reimbursed']);

// Create expense input
export const createExpenseSchema = z.object({
  projectId: z.string().cuid().optional().nullable(),
  description: z.string().min(1, 'תיאור ההוצאה הוא שדה חובה').max(500),
  amount: z.number().positive('הסכום חייב להיות חיובי'),
  currency: z.string().default('ILS'),
  date: z.string(),
  categoryId: z.string().cuid().optional().nullable(),
  supplierId: z.string().cuid().optional().nullable(),
  isBillable: z.boolean().default(false),
  markupPercent: z.number().min(0).max(100).optional(),
  receiptUrl: z.string().url().optional().nullable(),
  invoiceNumber: z.string().optional(),
});

// Update expense input
export const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: z.string().cuid(),
});

// List expenses input
export const listExpensesSchema = z.object({
  projectId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  supplierId: z.string().cuid().optional(),
  status: expenseStatusEnum.optional(),
  isBillable: z.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// Get/Delete by ID
export const expenseIdSchema = z.object({ id: z.string().cuid() });

// Approve/Reject expense
export const approveExpenseSchema = z.object({
  id: z.string().cuid(),
  notes: z.string().optional(),
});

export const rejectExpenseSchema = z.object({
  id: z.string().cuid(),
  reason: z.string().optional(),
});

// Upload receipt
export const uploadReceiptSchema = z.object({
  id: z.string().cuid(),
  receiptUrl: z.string().url(),
});

// Type exports
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ListExpensesInput = z.infer<typeof listExpensesSchema>;
