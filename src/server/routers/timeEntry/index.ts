import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import { createTimeEntrySchema, updateTimeEntrySchema, listTimeEntriesSchema, timeEntryIdSchema, startTimerSchema, timeEntrySummarySchema, timesheetSchema } from './schemas';

export const timeEntryRouter = createTRPCRouter({
  list: tenantProcedure.input(listTimeEntriesSchema).query(async ({ ctx, input }) => {
    const { projectId, userId, taskId, isBillable, dateFrom, dateTo, page, pageSize } = input;
    const skip = (page - 1) * pageSize;
    const where: Prisma.TimeEntryWhereInput = { tenantId: ctx.tenantId };

    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;
    if (taskId) where.taskId = taskId;
    if (isBillable !== undefined) where.isBillable = isBillable;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [entries, total] = await Promise.all([
      ctx.prisma.timeEntry.findMany({
        where, skip, take: pageSize, orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
        include: {
          project: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
          task: { select: { id: true, title: true } },
        },
      }),
      ctx.prisma.timeEntry.count({ where }),
    ]);

    const entriesWithComputed = entries.map((e) => ({
      ...e,
      computed: {
        totalAmount: e.isBillable && e.hourlyRate ? e.hours * e.hourlyRate : null,
        timeRange: e.startTime && e.endTime ? `${e.startTime} - ${e.endTime}` : null,
        durationFormatted: `${e.hours} שעות`,
      },
    }));

    return { items: entriesWithComputed, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: page * pageSize < total } };
  }),

  getById: tenantProcedure.input(timeEntryIdSchema).query(async ({ ctx, input }) => {
    const entry = await ctx.prisma.timeEntry.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
      include: {
        project: { select: { id: true, name: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        task: { select: { id: true, title: true } },
      },
    });
    if (!entry) throw new TRPCError({ code: 'NOT_FOUND', message: 'רישום זמן לא נמצא' });
    return entry;
  }),

  create: tenantProcedure.input(createTimeEntrySchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.timeEntry.create({
      data: {
        tenantId: ctx.tenantId, projectId: input.projectId, userId: ctx.auth.user.id,
        date: new Date(input.date), hours: input.hours, startTime: input.startTime, endTime: input.endTime,
        description: input.description, categoryId: input.categoryId, isBillable: input.isBillable,
        hourlyRate: input.hourlyRate, taskId: input.taskId,
      },
    });
  }),

  update: tenantProcedure.input(updateTimeEntrySchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    const existing = await ctx.prisma.timeEntry.findFirst({ where: { id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'רישום זמן לא נמצא' });

    return ctx.prisma.timeEntry.update({
      where: { id },
      data: { ...data, date: data.date ? new Date(data.date) : undefined },
    });
  }),

  delete: tenantProcedure.input(timeEntryIdSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.timeEntry.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'רישום זמן לא נמצא' });
    return ctx.prisma.timeEntry.delete({ where: { id: input.id } });
  }),

  startTimer: tenantProcedure.input(startTimerSchema).mutation(async ({ ctx, input }) => {
    const now = new Date();
    const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return ctx.prisma.timeEntry.create({
      data: {
        tenantId: ctx.tenantId, projectId: input.projectId, userId: ctx.auth.user.id,
        date: now, hours: 0, startTime, description: input.description, taskId: input.taskId,
        isBillable: true,
      },
    });
  }),

  stopTimer: tenantProcedure.input(timeEntryIdSchema).mutation(async ({ ctx, input }) => {
    const entry = await ctx.prisma.timeEntry.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!entry) throw new TRPCError({ code: 'NOT_FOUND', message: 'רישום זמן לא נמצא' });
    if (!entry.startTime || entry.endTime) throw new TRPCError({ code: 'BAD_REQUEST', message: 'הטיימר לא פעיל' });

    const now = new Date();
    const endTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const startParts = entry.startTime.split(':').map(Number);
    const endParts = endTime.split(':').map(Number);
    const startH = startParts[0] ?? 0;
    const startM = startParts[1] ?? 0;
    const endH = endParts[0] ?? 0;
    const endM = endParts[1] ?? 0;
    const hours = Math.round(((endH * 60 + endM) - (startH * 60 + startM)) / 60 * 100) / 100;

    return ctx.prisma.timeEntry.update({ where: { id: input.id }, data: { endTime, hours: Math.max(0.01, hours) } });
  }),

  running: tenantProcedure.query(async ({ ctx }) => {
    return ctx.prisma.timeEntry.findFirst({
      where: { tenantId: ctx.tenantId, userId: ctx.auth.user.id, startTime: { not: null }, endTime: null },
      include: { project: { select: { id: true, name: true } }, task: { select: { id: true, title: true } } },
    });
  }),

  summary: tenantProcedure.input(timeEntrySummarySchema).query(async ({ ctx, input }) => {
    const where: Prisma.TimeEntryWhereInput = { tenantId: ctx.tenantId };
    if (input.projectId) where.projectId = input.projectId;
    if (input.userId) where.userId = input.userId;
    if (input.dateFrom || input.dateTo) {
      where.date = {};
      if (input.dateFrom) where.date.gte = new Date(input.dateFrom);
      if (input.dateTo) where.date.lte = new Date(input.dateTo);
    }

    const [totalHours, billableHours, entries] = await Promise.all([
      ctx.prisma.timeEntry.aggregate({ where, _sum: { hours: true } }),
      ctx.prisma.timeEntry.aggregate({ where: { ...where, isBillable: true }, _sum: { hours: true } }),
      ctx.prisma.timeEntry.findMany({ where, select: { hours: true, hourlyRate: true, isBillable: true } }),
    ]);

    const billableAmount = entries.filter((e) => e.isBillable && e.hourlyRate).reduce((sum, e) => sum + (e.hours * (e.hourlyRate ?? 0)), 0);
    return { totalHours: totalHours._sum.hours ?? 0, billableHours: billableHours._sum.hours ?? 0, billableAmount };
  }),

  byUser: tenantProcedure.input(timeEntrySummarySchema).query(async ({ ctx, input }) => {
    const where: Prisma.TimeEntryWhereInput = { tenantId: ctx.tenantId };
    if (input.projectId) where.projectId = input.projectId;
    if (input.dateFrom || input.dateTo) { where.date = {}; if (input.dateFrom) where.date.gte = new Date(input.dateFrom); if (input.dateTo) where.date.lte = new Date(input.dateTo); }

    const entries = await ctx.prisma.timeEntry.groupBy({ by: ['userId'], where, _sum: { hours: true } });
    const userIds = entries.map((e) => e.userId);
    const users = await ctx.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true } });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return entries.map((e) => ({ userId: e.userId, userName: userMap.get(e.userId) ? `${userMap.get(e.userId)!.firstName} ${userMap.get(e.userId)!.lastName}` : 'לא ידוע', totalHours: e._sum.hours ?? 0 }));
  }),

  byProject: tenantProcedure.input(timeEntrySummarySchema).query(async ({ ctx, input }) => {
    const where: Prisma.TimeEntryWhereInput = { tenantId: ctx.tenantId };
    if (input.userId) where.userId = input.userId;
    if (input.dateFrom || input.dateTo) { where.date = {}; if (input.dateFrom) where.date.gte = new Date(input.dateFrom); if (input.dateTo) where.date.lte = new Date(input.dateTo); }

    const entries = await ctx.prisma.timeEntry.groupBy({ by: ['projectId'], where, _sum: { hours: true } });
    const projectIds = entries.map((e) => e.projectId);
    const projects = await ctx.prisma.project.findMany({ where: { id: { in: projectIds } }, select: { id: true, name: true } });
    const projectMap = new Map(projects.map((p) => [p.id, p]));

    return entries.map((e) => ({ projectId: e.projectId, projectName: projectMap.get(e.projectId)?.name ?? 'לא ידוע', totalHours: e._sum.hours ?? 0 }));
  }),

  timesheet: tenantProcedure.input(timesheetSchema).query(async ({ ctx, input }) => {
    const userId = input.userId ?? ctx.auth.user.id;
    const weekStart = new Date(input.weekStart);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);

    const entries = await ctx.prisma.timeEntry.findMany({
      where: { tenantId: ctx.tenantId, userId, date: { gte: weekStart, lt: weekEnd } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      include: { project: { select: { id: true, name: true } }, task: { select: { id: true, title: true } } },
    });

    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });
    return days.map((day) => ({ date: day.toISOString().split('T')[0], entries: entries.filter((e) => e.date.toDateString() === day.toDateString()), totalHours: entries.filter((e) => e.date.toDateString() === day.toDateString()).reduce((sum, e) => sum + e.hours, 0) }));
  }),
});
