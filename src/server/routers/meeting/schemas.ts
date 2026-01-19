import { z } from 'zod';

// Enums
export const meetingTypeEnum = z.enum([
  'site_visit', 'client_meeting', 'supplier', 'internal', 'presentation', 'installation', 'other',
]);
export const meetingStatusEnum = z.enum([
  'scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled',
]);
export const recurrenceFrequencyEnum = z.enum(['daily', 'weekly', 'biweekly', 'monthly']);

// Recurrence schema
export const recurrenceSchema = z.object({
  frequency: recurrenceFrequencyEnum,
  endDate: z.string().optional(),
  occurrences: z.number().int().positive().optional(),
});

// Create meeting input
export const createMeetingSchema = z.object({
  projectId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional(),
  title: z.string().min(1, 'כותרת הפגישה היא שדה חובה').max(255),
  description: z.string().optional(),
  location: z.string().max(255).optional(),
  meetingType: meetingTypeEnum.default('other'),
  startTime: z.string(), // ISO date string
  endTime: z.string(), // ISO date string
  isAllDay: z.boolean().default(false),
  attendeeUserIds: z.array(z.string().cuid()).default([]),
  externalAttendees: z.array(z.string()).default([]),
  status: meetingStatusEnum.default('scheduled'),
  notes: z.string().optional(),
  recurrence: recurrenceSchema.optional(),
});

// Update meeting input
export const updateMeetingSchema = createMeetingSchema.partial().extend({
  id: z.string().cuid(),
});

// List meetings input
export const listMeetingsSchema = z.object({
  projectId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional(),
  meetingType: meetingTypeEnum.optional(),
  status: meetingStatusEnum.optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
});

// Calendar view input
export const calendarViewSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
});

// Get meeting by ID
export const getMeetingByIdSchema = z.object({
  id: z.string().cuid(),
});

// Delete meeting
export const deleteMeetingSchema = z.object({
  id: z.string().cuid(),
});

// Update status
export const updateStatusSchema = z.object({
  id: z.string().cuid(),
  status: meetingStatusEnum,
});

// Reschedule
export const rescheduleSchema = z.object({
  id: z.string().cuid(),
  startTime: z.string(),
  endTime: z.string(),
});

// Create recurring meeting
export const createRecurringSchema = z.object({
  meeting: createMeetingSchema,
  recurrence: recurrenceSchema,
});

// Update recurrence
export const updateRecurrenceSchema = z.object({
  id: z.string().cuid(),
  recurrence: recurrenceSchema,
});

// Delete recurrence (entire series)
export const deleteRecurrenceSchema = z.object({
  id: z.string().cuid(),
});

// Add follow-up task
export const addFollowUpTaskSchema = z.object({
  meetingId: z.string().cuid(),
  title: z.string().min(1),
  assignedToId: z.string().cuid().optional(),
  dueDate: z.string().optional(),
});

// Send meeting invite
export const sendInviteSchema = z.object({
  id: z.string().cuid(),
  recipientEmails: z.array(z.string().email()).min(1),
  message: z.string().optional(),
});

// Type exports
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
export type ListMeetingsInput = z.infer<typeof listMeetingsSchema>;
