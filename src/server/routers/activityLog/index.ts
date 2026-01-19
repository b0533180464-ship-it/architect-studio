import { createTRPCRouter, tenantProcedure } from '../../trpc';
import { listActivitySchema, createActivitySchema } from './schemas';

export const activityLogRouter = createTRPCRouter({
  // List activities for an entity
  list: tenantProcedure.input(listActivitySchema).query(async ({ ctx, input }) => {
    const { entityType, entityId, limit } = input;

    const activities = await ctx.prisma.activityLog.findMany({
      where: { tenantId: ctx.tenantId, entityType, entityId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get user details for each activity
    const userIds = Array.from(new Set(activities.map((a: { userId: string }) => a.userId)));
    const users = await ctx.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, avatar: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return activities.map((activity: { userId: string }) => ({
      ...activity,
      user: userMap.get(activity.userId) || null,
    }));
  }),

  // Create activity log entry (internal use)
  create: tenantProcedure.input(createActivitySchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.activityLog.create({
      data: {
        tenantId: ctx.tenantId,
        userId: ctx.auth.user.id,
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        metadata: (input.metadata || {}) as object,
      },
    });
  }),

  // Get recent activities for dashboard
  recent: tenantProcedure.query(async ({ ctx }) => {
    const activities = await ctx.prisma.activityLog.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const userIds = Array.from(new Set(activities.map((a: { userId: string }) => a.userId)));
    const users = await ctx.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, avatar: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return activities.map((activity: { userId: string }) => ({
      ...activity,
      user: userMap.get(activity.userId) || null,
    }));
  }),
});
