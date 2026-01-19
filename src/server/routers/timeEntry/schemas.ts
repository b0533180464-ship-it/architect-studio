import { z } from 'zod';

// Create time entry input
export const createTimeEntrySchema = z.object({
  projectId: z.string().cuid(),
  date: z.string(),
  hours: z.number().positive('מספר השעות חייב להיות חיובי').max(24, 'מספר השעות לא יכול לעלות על 24'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().cuid().optional().nullable(),
  isBillable: z.boolean().default(true),
  hourlyRate: z.number().min(0).optional(),
  taskId: z.string().cuid().optional().nullable(),
});

// Update time entry input
export const updateTimeEntrySchema = createTimeEntrySchema.partial().extend({
  id: z.string().cuid(),
});

// List time entries input
export const listTimeEntriesSchema = z.object({
  projectId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  taskId: z.string().cuid().optional(),
  isBillable: z.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// Get/Delete by ID
export const timeEntryIdSchema = z.object({ id: z.string().cuid() });

// Timer operations
export const startTimerSchema = z.object({
  projectId: z.string().cuid(),
  taskId: z.string().cuid().optional().nullable(),
  description: z.string().optional(),
});

// Summary input
export const timeEntrySummarySchema = z.object({
  projectId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Timesheet input
export const timesheetSchema = z.object({
  userId: z.string().cuid().optional(),
  weekStart: z.string(), // Start of week date
});

// Type exports
export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
export type ListTimeEntriesInput = z.infer<typeof listTimeEntriesSchema>;
