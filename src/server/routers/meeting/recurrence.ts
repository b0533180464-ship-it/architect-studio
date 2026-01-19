/* eslint-disable complexity */
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { tenantProcedure } from '../../trpc';
import { createRecurringSchema, updateRecurrenceSchema, deleteRecurrenceSchema } from './schemas';

// Helper to calculate next occurrence date
function getNextDate(date: Date, frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'): Date {
  const next = new Date(date);
  switch (frequency) {
    case 'daily': next.setDate(next.getDate() + 1); break;
    case 'weekly': next.setDate(next.getDate() + 7); break;
    case 'biweekly': next.setDate(next.getDate() + 14); break;
    case 'monthly': next.setMonth(next.getMonth() + 1); break;
  }
  return next;
}

// Create recurring meeting series
export const createRecurringMutation = tenantProcedure.input(createRecurringSchema).mutation(async ({ ctx, input }) => {
  const { meeting, recurrence } = input;
  const { projectId, clientId, startTime, endTime, ...data } = meeting;

  // Validate project/client
  if (projectId) {
    const project = await ctx.prisma.project.findFirst({ where: { id: projectId, tenantId: ctx.tenantId } });
    if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });
  }
  if (clientId) {
    const client = await ctx.prisma.client.findFirst({ where: { id: clientId, tenantId: ctx.tenantId } });
    if (!client) throw new TRPCError({ code: 'NOT_FOUND', message: 'לקוח לא נמצא' });
  }

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const duration = endDate.getTime() - startDate.getTime();
  if (duration <= 0) throw new TRPCError({ code: 'BAD_REQUEST', message: 'שעת סיום חייבת להיות אחרי שעת התחלה' });

  // Create parent meeting
  const parent = await ctx.prisma.meeting.create({
    data: {
      ...data, projectId, clientId, tenantId: ctx.tenantId, createdById: ctx.auth.user.id,
      startTime: startDate, endTime: endDate, recurrence: recurrence as object,
    },
  });

  // Generate occurrences
  const occurrences: { startTime: Date; endTime: Date }[] = [];
  let currentStart = getNextDate(startDate, recurrence.frequency);
  const maxOccurrences = recurrence.occurrences || 52; // Default max 1 year of weekly
  const maxEndDate = recurrence.endDate ? new Date(recurrence.endDate) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

  while (occurrences.length < maxOccurrences - 1 && currentStart <= maxEndDate) {
    const currentEnd = new Date(currentStart.getTime() + duration);
    occurrences.push({ startTime: currentStart, endTime: currentEnd });
    currentStart = getNextDate(currentStart, recurrence.frequency);
  }

  // Create child meetings
  if (occurrences.length > 0) {
    await ctx.prisma.meeting.createMany({
      data: occurrences.map((occ) => ({
        ...data, projectId, clientId, tenantId: ctx.tenantId, createdById: ctx.auth.user.id,
        startTime: occ.startTime, endTime: occ.endTime,
        recurrence: recurrence as object, recurrenceParentId: parent.id,
      })),
    });
  }

  return { parent, occurrencesCreated: occurrences.length + 1 };
});

// Update recurrence pattern
export const updateRecurrenceMutation = tenantProcedure.input(updateRecurrenceSchema).mutation(async ({ ctx, input }) => {
  const { id, recurrence } = input;

  const existing = await ctx.prisma.meeting.findFirst({ where: { id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פגישה לא נמצאה' });

  // Update the parent and all future children
  const parentId = existing.recurrenceParentId || id;

  return ctx.prisma.meeting.updateMany({
    where: {
      tenantId: ctx.tenantId,
      OR: [{ id: parentId }, { recurrenceParentId: parentId }],
      startTime: { gte: new Date() },
    },
    data: { recurrence: recurrence as object },
  });
});

// Delete entire recurrence series
export const deleteRecurrenceMutation = tenantProcedure.input(deleteRecurrenceSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.meeting.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פגישה לא נמצאה' });

  const parentId = existing.recurrenceParentId || input.id;

  const deleted = await ctx.prisma.meeting.deleteMany({
    where: {
      tenantId: ctx.tenantId,
      OR: [{ id: parentId }, { recurrenceParentId: parentId }],
    },
  });

  return { deletedCount: deleted.count };
});

// Delete future occurrences only
export const deleteFutureOccurrencesMutation = tenantProcedure.input(deleteRecurrenceSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.meeting.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פגישה לא נמצאה' });

  const parentId = existing.recurrenceParentId || input.id;

  // Delete future meetings, but keep the current one
  const deleted = await ctx.prisma.meeting.deleteMany({
    where: {
      tenantId: ctx.tenantId,
      recurrenceParentId: parentId,
      startTime: { gt: existing.startTime },
    },
  });

  // Remove recurrence from the current meeting if it's the last one
  await ctx.prisma.meeting.update({
    where: { id: input.id },
    data: { recurrence: Prisma.JsonNull, recurrenceParentId: null },
  });

  return { deletedCount: deleted.count };
});
