import { z } from 'zod';

// Enums
export const priorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);
export const linkedEntityTypeEnum = z.enum(['room', 'product', 'payment', 'document', 'change_order']);

// Checklist item schema
export const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
  completedAt: z.string().optional(),
});

// Reminder schema
export const reminderSchema = z.object({
  type: z.enum(['email', 'notification', 'sms']),
  beforeMinutes: z.number().int().positive(),
});

// Create task input
export const createTaskSchema = z.object({
  projectId: z.string().cuid().optional(),
  title: z.string().min(1, 'כותרת המשימה היא שדה חובה').max(500),
  description: z.string().optional(),
  statusId: z.string().cuid().optional(),
  priority: priorityEnum.default('medium'),
  categoryId: z.string().cuid().optional(),
  assignedToId: z.string().cuid().optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  startDate: z.string().optional(),
  reminders: z.array(reminderSchema).optional(),
  linkedEntityType: linkedEntityTypeEnum.optional(),
  linkedEntityId: z.string().cuid().optional(),
  checklist: z.array(checklistItemSchema).optional(),
});

// Update task input
export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().cuid(),
});

// List tasks input
export const listTasksSchema = z.object({
  projectId: z.string().cuid().optional(),
  assignedToId: z.string().cuid().optional(),
  statusId: z.string().cuid().optional(),
  priority: priorityEnum.optional(),
  dueDate: z.enum(['today', 'overdue', 'upcoming', 'no_date']).optional(),
  search: z.string().optional(),
  includeCompleted: z.boolean().default(false),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
});

// Get task by ID
export const getTaskByIdSchema = z.object({
  id: z.string().cuid(),
});

// Delete task
export const deleteTaskSchema = z.object({
  id: z.string().cuid(),
});

// Complete task
export const completeTaskSchema = z.object({
  id: z.string().cuid(),
});

// Assign task
export const assignTaskSchema = z.object({
  id: z.string().cuid(),
  assignedToId: z.string().cuid().nullable(),
});

// Update checklist
export const updateChecklistSchema = z.object({
  id: z.string().cuid(),
  checklist: z.array(checklistItemSchema),
});

// Update status
export const updateStatusSchema = z.object({
  id: z.string().cuid(),
  statusId: z.string().cuid(),
});

// Bulk update status
export const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.string().cuid()).min(1),
  statusId: z.string().cuid(),
});

// Bulk create tasks
export const bulkCreateSchema = z.object({
  tasks: z.array(createTaskSchema).min(1).max(50),
});

// Bulk delete tasks
export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().cuid()).min(1).max(50),
});

// Add reminder
export const addReminderSchema = z.object({
  id: z.string().cuid(),
  reminder: reminderSchema,
});

// Remove reminder
export const removeReminderSchema = z.object({
  id: z.string().cuid(),
  reminderIndex: z.number().int().min(0),
});

// Type exports
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksInput = z.infer<typeof listTasksSchema>;
