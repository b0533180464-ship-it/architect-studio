/* eslint-disable max-lines-per-function */
import { TRPCError } from '@trpc/server';
import { tenantProcedure } from '../../trpc';
import {
  createTaskSchema, updateTaskSchema, deleteTaskSchema, completeTaskSchema,
  assignTaskSchema, updateChecklistSchema, updateStatusSchema, bulkUpdateStatusSchema,
  bulkCreateSchema, bulkDeleteSchema, addReminderSchema, removeReminderSchema,
} from './schemas';

export const createMutation = tenantProcedure.input(createTaskSchema).mutation(async ({ ctx, input }) => {
  const { projectId, dueDate, startDate, ...data } = input;
  if (projectId) {
    const project = await ctx.prisma.project.findFirst({ where: { id: projectId, tenantId: ctx.tenantId } });
    if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });
  }
  if (data.assignedToId) {
    const user = await ctx.prisma.user.findFirst({ where: { id: data.assignedToId, tenantId: ctx.tenantId, isActive: true } });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'משתמש לא נמצא' });
  }
  return ctx.prisma.task.create({
    data: { ...data, projectId, tenantId: ctx.tenantId, createdById: ctx.auth.user.id, dueDate: dueDate ? new Date(dueDate) : null, startDate: startDate ? new Date(startDate) : null, reminders: data.reminders || [], checklist: data.checklist || [] },
    include: { project: { select: { id: true, name: true } }, assignedTo: { select: { id: true, firstName: true, lastName: true } } },
  });
});

export const updateMutation = tenantProcedure.input(updateTaskSchema).mutation(async ({ ctx, input }) => {
  const { id, dueDate, startDate, ...data } = input;
  const existing = await ctx.prisma.task.findFirst({ where: { id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'משימה לא נמצאה' });
  return ctx.prisma.task.update({
    where: { id },
    data: { ...data, dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined, startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined },
    include: { project: { select: { id: true, name: true } }, assignedTo: { select: { id: true, firstName: true, lastName: true } } },
  });
});

export const deleteMutation = tenantProcedure.input(deleteTaskSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.task.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'משימה לא נמצאה' });
  return ctx.prisma.task.delete({ where: { id: input.id } });
});

export const completeMutation = tenantProcedure.input(completeTaskSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.task.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'משימה לא נמצאה' });
  return ctx.prisma.task.update({ where: { id: input.id }, data: { completedAt: new Date() } });
});

export const reopenMutation = tenantProcedure.input(completeTaskSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.task.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'משימה לא נמצאה' });
  return ctx.prisma.task.update({ where: { id: input.id }, data: { completedAt: null } });
});

export const assignMutation = tenantProcedure.input(assignTaskSchema).mutation(async ({ ctx, input }) => {
  const { id, assignedToId } = input;
  const existing = await ctx.prisma.task.findFirst({ where: { id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'משימה לא נמצאה' });
  if (assignedToId) {
    const user = await ctx.prisma.user.findFirst({ where: { id: assignedToId, tenantId: ctx.tenantId, isActive: true } });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'משתמש לא נמצא' });
  }
  return ctx.prisma.task.update({ where: { id }, data: { assignedToId }, include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } } });
});

export const updateChecklistMutation = tenantProcedure.input(updateChecklistSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.task.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'משימה לא נמצאה' });
  return ctx.prisma.task.update({ where: { id: input.id }, data: { checklist: input.checklist } });
});

export const updateStatusMutation = tenantProcedure.input(updateStatusSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.task.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'משימה לא נמצאה' });
  return ctx.prisma.task.update({
    where: { id: input.id }, data: { statusId: input.statusId },
    include: { project: { select: { id: true, name: true } }, assignedTo: { select: { id: true, firstName: true, lastName: true } } },
  });
});

export const bulkUpdateStatusMutation = tenantProcedure.input(bulkUpdateStatusSchema).mutation(async ({ ctx, input }) => {
  const result = await ctx.prisma.task.updateMany({ where: { id: { in: input.ids }, tenantId: ctx.tenantId }, data: { statusId: input.statusId } });
  return { count: result.count };
});

export const bulkCreateMutation = tenantProcedure.input(bulkCreateSchema).mutation(async ({ ctx, input }) => {
  const tasks = await ctx.prisma.$transaction(
    input.tasks.map((task) => {
      const { dueDate, startDate, ...data } = task;
      return ctx.prisma.task.create({
        data: { ...data, tenantId: ctx.tenantId, createdById: ctx.auth.user.id, dueDate: dueDate ? new Date(dueDate) : null, startDate: startDate ? new Date(startDate) : null, reminders: data.reminders || [], checklist: data.checklist || [] },
      });
    })
  );
  return { count: tasks.length, tasks };
});

export const bulkDeleteMutation = tenantProcedure.input(bulkDeleteSchema).mutation(async ({ ctx, input }) => {
  const result = await ctx.prisma.task.deleteMany({ where: { id: { in: input.ids }, tenantId: ctx.tenantId } });
  return { count: result.count };
});

export const addReminderMutation = tenantProcedure.input(addReminderSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.task.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'משימה לא נמצאה' });
  const reminders = Array.isArray(existing.reminders) ? [...(existing.reminders as object[]), input.reminder] : [input.reminder];
  return ctx.prisma.task.update({ where: { id: input.id }, data: { reminders } });
});

export const removeReminderMutation = tenantProcedure.input(removeReminderSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.task.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'משימה לא נמצאה' });
  const reminders = Array.isArray(existing.reminders) ? (existing.reminders as object[]).filter((_, i) => i !== input.reminderIndex) : [];
  return ctx.prisma.task.update({ where: { id: input.id }, data: { reminders } });
});
