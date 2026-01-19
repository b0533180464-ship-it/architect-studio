import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { tenantProcedure } from '../../trpc';
import { listProjectsSchema, getProjectByIdSchema, getActivitySchema, getTimelineSchema } from './schemas';

// Helper to get config entities map
async function getConfigMap(prisma: Prisma.TransactionClient, tenantId: string) {
  const entities = await prisma.configurableEntity.findMany({
    where: { tenantId, entityType: { in: ['project_type', 'project_status', 'project_phase'] } },
  });
  return new Map(entities.map((e) => [e.id, e]));
}

// List projects with pagination and filters
export const list = tenantProcedure.input(listProjectsSchema).query(async ({ ctx, input }) => {
  const { page, pageSize, clientId, statusId, phaseId, priority, isVIP, city, search, assignedUserId, sortBy, sortOrder, includeArchived } = input;
  const skip = (page - 1) * pageSize;

  const where: Prisma.ProjectWhereInput = { tenantId: ctx.tenantId };

  if (!includeArchived) where.archivedAt = null;
  if (clientId) where.clientId = clientId;
  if (statusId) where.statusId = statusId;
  if (phaseId) where.phaseId = phaseId;
  if (priority) where.priority = priority;
  if (isVIP !== undefined) where.isVIP = isVIP;
  if (city) where.city = city;
  if (assignedUserId) where.assignedUsers = { some: { id: assignedUserId } };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
      { client: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [projects, total, configMap] = await Promise.all([
    ctx.prisma.project.findMany({
      where, skip, take: pageSize, orderBy: { [sortBy]: sortOrder },
      include: {
        client: { select: { id: true, name: true, type: true } },
        assignedUsers: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    ctx.prisma.project.count({ where }),
    getConfigMap(ctx.prisma, ctx.tenantId),
  ]);

  const items = projects.map((p) => ({
    ...p,
    projectType: p.typeId ? configMap.get(p.typeId) : null,
    projectStatus: p.statusId ? configMap.get(p.statusId) : null,
    projectPhase: p.phaseId ? configMap.get(p.phaseId) : null,
  }));

  return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: page * pageSize < total } };
});

// Get project by ID with full details
export const getById = tenantProcedure.input(getProjectByIdSchema).query(async ({ ctx, input }) => {
  const [project, configMap] = await Promise.all([
    ctx.prisma.project.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
      include: {
        client: true,
        assignedUsers: { select: { id: true, firstName: true, lastName: true, avatar: true, title: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        referredByClient: { select: { id: true, name: true } },
      },
    }),
    getConfigMap(ctx.prisma, ctx.tenantId),
  ]);

  if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });

  const now = new Date();
  let daysRemaining: number | null = null;
  let isOverdue = false;
  if (project.expectedEndDate && !project.actualEndDate) {
    daysRemaining = Math.ceil((new Date(project.expectedEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    isOverdue = daysRemaining < 0;
  }

  return {
    ...project,
    projectType: project.typeId ? configMap.get(project.typeId) : null,
    projectStatus: project.statusId ? configMap.get(project.statusId) : null,
    projectPhase: project.phaseId ? configMap.get(project.phaseId) : null,
    computed: { daysRemaining, isOverdue },
  };
});

// Get distinct cities for filter dropdown
export const getCities = tenantProcedure.query(async ({ ctx }) => {
  const projects = await ctx.prisma.project.findMany({
    where: { tenantId: ctx.tenantId, city: { not: null } },
    select: { city: true },
    distinct: ['city'],
  });
  return projects.map((p) => p.city).filter(Boolean) as string[];
});

// Quick search (for autocomplete)
export const search = tenantProcedure.input(z.object({ query: z.string().min(1) })).query(async ({ ctx, input }) => {
  return ctx.prisma.project.findMany({
    where: {
      tenantId: ctx.tenantId, archivedAt: null,
      OR: [
        { name: { contains: input.query, mode: 'insensitive' } },
        { code: { contains: input.query, mode: 'insensitive' } },
        { client: { name: { contains: input.query, mode: 'insensitive' } } },
      ],
    },
    take: 10,
    select: { id: true, name: true, code: true, priority: true, isVIP: true, client: { select: { id: true, name: true } } },
  });
});

// Get project statistics for dashboard
export const getStats = tenantProcedure.query(async ({ ctx }) => {
  const [total, active, vip, byPriority] = await Promise.all([
    ctx.prisma.project.count({ where: { tenantId: ctx.tenantId } }),
    ctx.prisma.project.count({ where: { tenantId: ctx.tenantId, archivedAt: null } }),
    ctx.prisma.project.count({ where: { tenantId: ctx.tenantId, archivedAt: null, isVIP: true } }),
    ctx.prisma.project.groupBy({ by: ['priority'], where: { tenantId: ctx.tenantId, archivedAt: null }, _count: true }),
  ]);

  return { total, active, archived: total - active, vip, byPriority: Object.fromEntries(byPriority.map((p) => [p.priority, p._count])) };
});

// Get project activity log
export const getActivity = tenantProcedure.input(getActivitySchema).query(async ({ ctx, input }) => {
  const { projectId, limit } = input;

  const project = await ctx.prisma.project.findFirst({ where: { id: projectId, tenantId: ctx.tenantId } });
  if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });

  const activities = await ctx.prisma.activityLog.findMany({
    where: { tenantId: ctx.tenantId, entityType: 'project', entityId: projectId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const userIds = Array.from(new Set(activities.map((a: { userId: string }) => a.userId)));
  const users = await ctx.prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true, avatar: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return activities.map((activity: { userId: string }) => ({ ...activity, user: userMap.get(activity.userId) || null }));
});

// Get project timeline
export const getTimeline = tenantProcedure.input(getTimelineSchema).query(async ({ ctx, input }) => {
  const { projectId } = input;

  const project = await ctx.prisma.project.findFirst({ where: { id: projectId, tenantId: ctx.tenantId } });
  if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });

  const [tasks, meetings, documents] = await Promise.all([
    ctx.prisma.task.findMany({ where: { tenantId: ctx.tenantId, projectId }, select: { id: true, title: true, dueDate: true, completedAt: true, createdAt: true } }),
    ctx.prisma.meeting.findMany({ where: { tenantId: ctx.tenantId, projectId }, select: { id: true, title: true, startTime: true, status: true, createdAt: true } }),
    ctx.prisma.document.findMany({ where: { tenantId: ctx.tenantId, projectId, parentId: null }, select: { id: true, name: true, createdAt: true } }),
  ]);

  const timeline = [
    ...tasks.map((t) => ({ type: 'task' as const, id: t.id, title: t.title, date: t.dueDate || t.createdAt, status: t.completedAt ? 'completed' : 'pending' })),
    ...meetings.map((m) => ({ type: 'meeting' as const, id: m.id, title: m.title, date: m.startTime, status: m.status })),
    ...documents.map((d) => ({ type: 'document' as const, id: d.id, title: d.name, date: d.createdAt, status: 'created' })),
  ];

  return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});
