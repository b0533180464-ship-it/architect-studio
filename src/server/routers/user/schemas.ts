import { z } from 'zod';

export const userUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  title: z.string().max(100).nullable().optional(),
  language: z.string().max(5).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export const notificationSettingsSchema = z.object({
  email: z.object({
    taskAssigned: z.boolean().optional(),
    taskDue: z.boolean().optional(),
    paymentReceived: z.boolean().optional(),
    approvalNeeded: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
  }).optional(),
  push: z.object({
    enabled: z.boolean().optional(),
    urgentOnly: z.boolean().optional(),
  }).optional(),
  inApp: z.object({
    enabled: z.boolean().optional(),
    sound: z.boolean().optional(),
  }).optional(),
});

export const roleUpdateSchema = z.object({
  userId: z.string(),
  role: z.enum(['owner', 'manager', 'member']),
});

export const permissionsSchema = z.object({
  canViewFinancials: z.boolean().optional(),
  canEditFinancials: z.boolean().optional(),
  canManageUsers: z.boolean().optional(),
  canDeleteRecords: z.boolean().optional(),
  canAccessAllProjects: z.boolean().optional(),
  canManageSettings: z.boolean().optional(),
});

export const permissionsUpdateSchema = z.object({
  userId: z.string(),
  permissions: permissionsSchema,
});

export const userIdSchema = z.object({ id: z.string() });
export const userDeactivateSchema = z.object({ userId: z.string() });
