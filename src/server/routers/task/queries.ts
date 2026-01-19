/* eslint-disable max-lines-per-function, complexity */
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { tenantProcedure } from '../../trpc';
import { listTasksSchema, getTaskByIdSchema } from './schemas';

export const listQuery = tenantProcedure.input(listTasksSchema).query(async ({ ctx, input }) => {
  const { projectId, assignedToId, statusId, priority, dueDate, search, includeCompleted, page, pageSize } = input;
  const skip = (page - 1) * pageSize;
  const where: Prisma.TaskWhereInput = { tenantId: ctx.tenantId };

  if (projectId) where.projectId = projectId;
  if (assignedToId) where.assignedToId = assignedToId;
  if (statusId) where.statusId = statusId;
  if (priority) where.priority = priority;
  if (!includeCompleted) where.completedAt = null;
  if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (dueDate === 'today') where.dueDate = { gte: today, lt: tomorrow };
  else if (dueDate === 'overdue') { where.dueDate = { lt: today }; where.completedAt = null; }
  else if (dueDate === 'upcoming') where.dueDate = { gte: tomorrow };
  else if (dueDate === 'no_date') where.dueDate = null;

  const [tasks, total, configEntities] = await Promise.all([
    ctx.prisma.task.findMany({
      where, skip, take: pageSize,
      orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    ctx.prisma.task.count({ where }),
    ctx.prisma.configurableEntity.findMany({ where: { tenantId: ctx.tenantId, entityType: { in: ['task_status', 'task_category'] } } }),
  ]);

  const configMap = new Map(configEntities.map((e) => [e.id, e]));
  const tasksWithComputed = tasks.map((task) => {
    const isOverdue = task.dueDate && !task.completedAt && task.dueDate < now;
    const checklist = task.checklist as { completed: boolean }[] || [];
    return {
      ...task, taskStatus: task.statusId ? configMap.get(task.statusId) : null, taskCategory: task.categoryId ? configMap.get(task.categoryId) : null,
      computed: { isOverdue, checklistTotal: checklist.length, checklistCompleted: checklist.filter((item) => item.completed).length, checklistProgress: checklist.length > 0 ? Math.round((checklist.filter((item) => item.completed).length / checklist.length) * 100) : null },
    };
  });

  return { items: tasksWithComputed, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: page * pageSize < total } };
});

export const myTasksQuery = tenantProcedure.query(async ({ ctx }) => {
  return ctx.prisma.task.findMany({
    where: { tenantId: ctx.tenantId, assignedToId: ctx.auth.user.id, completedAt: null },
    orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { priority: 'desc' }],
    take: 20,
    include: { project: { select: { id: true, name: true } } },
  });
});

export const overdueQuery = tenantProcedure.query(async ({ ctx }) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return ctx.prisma.task.findMany({
    where: { tenantId: ctx.tenantId, dueDate: { lt: today }, completedAt: null },
    orderBy: { dueDate: 'asc' },
    include: { project: { select: { id: true, name: true } }, assignedTo: { select: { id: true, firstName: true, lastName: true } } },
  });
});

export const todayQuery = tenantProcedure.query(async ({ ctx }) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  return ctx.prisma.task.findMany({
    where: { tenantId: ctx.tenantId, dueDate: { gte: today, lt: tomorrow }, completedAt: null },
    orderBy: { dueTime: 'asc' },
    include: { project: { select: { id: true, name: true } }, assignedTo: { select: { id: true, firstName: true, lastName: true } } },
  });
});

export const getByIdQuery = tenantProcedure.input(getTaskByIdSchema).query(async ({ ctx, input }) => {
  const [task, configEntities] = await Promise.all([
    ctx.prisma.task.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        room: { select: { id: true, name: true } },
      },
    }),
    ctx.prisma.configurableEntity.findMany({ where: { tenantId: ctx.tenantId, entityType: { in: ['task_status', 'task_category'] } } }),
  ]);
  if (!task) throw new TRPCError({ code: 'NOT_FOUND', message: 'משימה לא נמצאה' });

  const configMap = new Map(configEntities.map((e) => [e.id, e]));
  const now = new Date();
  const checklist = task.checklist as { completed: boolean }[] || [];
  return {
    ...task, taskStatus: task.statusId ? configMap.get(task.statusId) : null, taskCategory: task.categoryId ? configMap.get(task.categoryId) : null,
    computed: { isOverdue: task.dueDate && !task.completedAt && task.dueDate < now, daysUntilDue: task.dueDate ? Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null, checklistTotal: checklist.length, checklistCompleted: checklist.filter((item) => item.completed).length },
  };
});

export const getStatsQuery = tenantProcedure.query(async ({ ctx }) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [total, completed, overdue, dueToday, myTasks] = await Promise.all([
    ctx.prisma.task.count({ where: { tenantId: ctx.tenantId } }),
    ctx.prisma.task.count({ where: { tenantId: ctx.tenantId, completedAt: { not: null } } }),
    ctx.prisma.task.count({ where: { tenantId: ctx.tenantId, dueDate: { lt: today }, completedAt: null } }),
    ctx.prisma.task.count({ where: { tenantId: ctx.tenantId, dueDate: { gte: today, lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }, completedAt: null } }),
    ctx.prisma.task.count({ where: { tenantId: ctx.tenantId, assignedToId: ctx.auth.user.id, completedAt: null } }),
  ]);
  return { total, completed, pending: total - completed, overdue, dueToday, myTasks };
});
