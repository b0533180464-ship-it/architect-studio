import { createTRPCRouter, protectedProcedure } from '../../trpc';
import {
  displaySettingsSchema,
  notificationsSettingsSchema,
  shortcutsSettingsSchema,
  dashboardSettingsSchema,
  privacySettingsSchema,
  userSettingsUpdateSchema,
} from './schemas';
import { DEFAULT_SETTINGS, deepMerge } from './defaults';

export const settingsRouter = createTRPCRouter({
  // Get all settings
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.userSettings.findUnique({
      where: { userId: ctx.auth.user.id },
    });

    if (!settings) {
      return DEFAULT_SETTINGS;
    }

    return {
      display: deepMerge(DEFAULT_SETTINGS.display, (settings.display as object) || {}),
      notifications: deepMerge(DEFAULT_SETTINGS.notifications, (settings.notifications as object) || {}),
      shortcuts: deepMerge(DEFAULT_SETTINGS.shortcuts, (settings.shortcuts as object) || {}),
      dashboard: deepMerge(DEFAULT_SETTINGS.dashboard, (settings.dashboard as object) || {}),
      privacy: deepMerge(DEFAULT_SETTINGS.privacy, (settings.privacy as object) || {}),
    };
  }),

  // Update all settings at once
  // eslint-disable-next-line complexity
  updateAll: protectedProcedure.input(userSettingsUpdateSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.userSettings.findUnique({
      where: { userId: ctx.auth.user.id },
    });

    if (existing) {
      return ctx.prisma.userSettings.update({
        where: { userId: ctx.auth.user.id },
        data: {
          display: input.display ? deepMerge((existing.display as object) || {}, input.display) : undefined,
          notifications: input.notifications
            ? deepMerge((existing.notifications as object) || {}, input.notifications)
            : undefined,
          shortcuts: input.shortcuts ? deepMerge((existing.shortcuts as object) || {}, input.shortcuts) : undefined,
          dashboard: input.dashboard ? deepMerge((existing.dashboard as object) || {}, input.dashboard) : undefined,
          privacy: input.privacy ? deepMerge((existing.privacy as object) || {}, input.privacy) : undefined,
        },
      });
    }

    return ctx.prisma.userSettings.create({
      data: {
        userId: ctx.auth.user.id,
        display: input.display || {},
        notifications: input.notifications || {},
        shortcuts: input.shortcuts || {},
        dashboard: input.dashboard || {},
        privacy: input.privacy || {},
      },
    });
  }),

  updateDisplay: protectedProcedure.input(displaySettingsSchema).mutation(async ({ ctx, input }) => {
    return upsertSettings(ctx, 'display', input);
  }),

  updateNotifications: protectedProcedure.input(notificationsSettingsSchema).mutation(async ({ ctx, input }) => {
    return upsertSettingsDeep(ctx, 'notifications', input);
  }),

  updateShortcuts: protectedProcedure.input(shortcutsSettingsSchema).mutation(async ({ ctx, input }) => {
    return upsertSettings(ctx, 'shortcuts', input);
  }),

  updateDashboard: protectedProcedure.input(dashboardSettingsSchema).mutation(async ({ ctx, input }) => {
    return upsertSettings(ctx, 'dashboard', input);
  }),

  updatePrivacy: protectedProcedure.input(privacySettingsSchema).mutation(async ({ ctx, input }) => {
    return upsertSettings(ctx, 'privacy', input);
  }),

  // Reset settings to defaults
  resetToDefaults: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.userSettings.deleteMany({
      where: { userId: ctx.auth.user.id },
    });
    return DEFAULT_SETTINGS;
  }),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertSettings(ctx: any, field: string, input: object) {
  const existing = await ctx.prisma.userSettings.findUnique({
    where: { userId: ctx.auth.user.id },
  });

  if (existing) {
    const current = (existing[field] as object) || {};
    return ctx.prisma.userSettings.update({
      where: { userId: ctx.auth.user.id },
      data: { [field]: { ...current, ...input } },
    });
  }

  return ctx.prisma.userSettings.create({
    data: { userId: ctx.auth.user.id, [field]: input },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertSettingsDeep(ctx: any, field: string, input: object) {
  const existing = await ctx.prisma.userSettings.findUnique({
    where: { userId: ctx.auth.user.id },
  });

  if (existing) {
    const current = (existing[field] as object) || {};
    return ctx.prisma.userSettings.update({
      where: { userId: ctx.auth.user.id },
      data: { [field]: deepMerge(current, input) },
    });
  }

  return ctx.prisma.userSettings.create({
    data: { userId: ctx.auth.user.id, [field]: input },
  });
}
