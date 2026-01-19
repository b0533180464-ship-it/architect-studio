import { z } from 'zod';

// Display settings schema
export const displaySettingsSchema = z.object({
  language: z.enum(['he', 'en']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).optional(),
  timeFormat: z.enum(['24h', '12h']).optional(),
  timezone: z.string().optional(),
  startOfWeek: z.enum(['sunday', 'monday']).optional(),
  currency: z.string().length(3).optional(),
});

// Email notification settings
export const emailNotificationsSchema = z.object({
  enabled: z.boolean().optional(),
  taskAssigned: z.boolean().optional(),
  taskDue: z.boolean().optional(),
  taskOverdue: z.boolean().optional(),
  mentions: z.boolean().optional(),
  comments: z.boolean().optional(),
  approvalNeeded: z.boolean().optional(),
  approvalReceived: z.boolean().optional(),
  paymentReceived: z.boolean().optional(),
  deliveryUpdates: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  digestFrequency: z.enum(['daily', 'weekly', 'never']).optional(),
  digestDay: z.enum(['sunday', 'monday']).optional(),
  digestTime: z.string().optional(),
});

// Push notification settings
export const pushNotificationsSchema = z.object({
  enabled: z.boolean().optional(),
  taskAssigned: z.boolean().optional(),
  mentions: z.boolean().optional(),
  urgentOnly: z.boolean().optional(),
});

// In-app notification settings
export const inAppNotificationsSchema = z.object({
  enabled: z.boolean().optional(),
  sound: z.boolean().optional(),
});

// Full notifications schema
export const notificationsSettingsSchema = z.object({
  inApp: inAppNotificationsSchema.optional(),
  email: emailNotificationsSchema.optional(),
  push: pushNotificationsSchema.optional(),
});

// Shortcuts settings
export const shortcutsSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  customShortcuts: z.record(z.string()).optional(),
});

// Dashboard settings
export const dashboardSettingsSchema = z.object({
  defaultView: z.enum(['overview', 'tasks', 'calendar', 'projects']).optional(),
  widgetOrder: z.array(z.string()).optional(),
  hiddenWidgets: z.array(z.string()).optional(),
});

// Privacy settings
export const privacySettingsSchema = z.object({
  showOnlineStatus: z.boolean().optional(),
  showCurrentActivity: z.boolean().optional(),
});

// Full settings update (partial)
export const userSettingsUpdateSchema = z.object({
  display: displaySettingsSchema.optional(),
  notifications: notificationsSettingsSchema.optional(),
  shortcuts: shortcutsSettingsSchema.optional(),
  dashboard: dashboardSettingsSchema.optional(),
  privacy: privacySettingsSchema.optional(),
});
