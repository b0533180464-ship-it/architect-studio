import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { tenantProcedure } from '../../trpc';
import {
  createMeetingSchema,
  updateMeetingSchema,
  deleteMeetingSchema,
  getMeetingByIdSchema,
  rescheduleSchema,
  addFollowUpTaskSchema,
  sendInviteSchema,
} from './schemas';

export const createMutation = tenantProcedure.input(createMeetingSchema).mutation(async ({ ctx, input }) => {
  const { projectId, clientId, startTime, endTime, ...data } = input;

  if (projectId) {
    const project = await ctx.prisma.project.findFirst({ where: { id: projectId, tenantId: ctx.tenantId } });
    if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });
  }

  if (clientId) {
    const client = await ctx.prisma.client.findFirst({ where: { id: clientId, tenantId: ctx.tenantId } });
    if (!client) throw new TRPCError({ code: 'NOT_FOUND', message: 'לקוח לא נמצא' });
  }

  if (data.attendeeUserIds.length > 0) {
    const validUsers = await ctx.prisma.user.count({ where: { id: { in: data.attendeeUserIds }, tenantId: ctx.tenantId, isActive: true } });
    if (validUsers !== data.attendeeUserIds.length) throw new TRPCError({ code: 'BAD_REQUEST', message: 'חלק מהמשתתפים לא נמצאו' });
  }

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  if (endDate <= startDate) throw new TRPCError({ code: 'BAD_REQUEST', message: 'שעת סיום חייבת להיות אחרי שעת התחלה' });

  return ctx.prisma.meeting.create({
    data: { ...data, projectId, clientId, tenantId: ctx.tenantId, createdById: ctx.auth.user.id, startTime: startDate, endTime: endDate },
    include: { project: { select: { id: true, name: true } }, client: { select: { id: true, name: true } } },
  });
});

export const updateMutation = tenantProcedure.input(updateMeetingSchema).mutation(async ({ ctx, input }) => {
  const { id, startTime, endTime, ...data } = input;

  const existing = await ctx.prisma.meeting.findFirst({ where: { id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פגישה לא נמצאה' });

  const updateData: Prisma.MeetingUpdateInput = { ...data };
  if (startTime) updateData.startTime = new Date(startTime);
  if (endTime) updateData.endTime = new Date(endTime);

  return ctx.prisma.meeting.update({
    where: { id }, data: updateData,
    include: { project: { select: { id: true, name: true } }, client: { select: { id: true, name: true } } },
  });
});

export const deleteMutation = tenantProcedure.input(deleteMeetingSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.meeting.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פגישה לא נמצאה' });
  return ctx.prisma.meeting.delete({ where: { id: input.id } });
});

export const confirmMutation = tenantProcedure.input(getMeetingByIdSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.meeting.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פגישה לא נמצאה' });
  return ctx.prisma.meeting.update({ where: { id: input.id }, data: { status: 'confirmed' } });
});

export const cancelMutation = tenantProcedure.input(getMeetingByIdSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.meeting.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פגישה לא נמצאה' });
  return ctx.prisma.meeting.update({ where: { id: input.id }, data: { status: 'cancelled' } });
});

export const completeMutation = tenantProcedure.input(getMeetingByIdSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.meeting.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פגישה לא נמצאה' });
  return ctx.prisma.meeting.update({ where: { id: input.id }, data: { status: 'completed' } });
});

export const rescheduleMutation = tenantProcedure.input(rescheduleSchema).mutation(async ({ ctx, input }) => {
  const { id, startTime, endTime } = input;

  const existing = await ctx.prisma.meeting.findFirst({ where: { id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פגישה לא נמצאה' });

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  if (endDate <= startDate) throw new TRPCError({ code: 'BAD_REQUEST', message: 'שעת סיום חייבת להיות אחרי שעת התחלה' });

  return ctx.prisma.meeting.update({
    where: { id },
    data: { startTime: startDate, endTime: endDate, status: 'rescheduled' },
  });
});

export const addFollowUpTaskMutation = tenantProcedure.input(addFollowUpTaskSchema).mutation(async ({ ctx, input }) => {
  const { meetingId, title, assignedToId, dueDate } = input;

  const meeting = await ctx.prisma.meeting.findFirst({ where: { id: meetingId, tenantId: ctx.tenantId } });
  if (!meeting) throw new TRPCError({ code: 'NOT_FOUND', message: 'פגישה לא נמצאה' });

  return ctx.prisma.task.create({
    data: {
      tenantId: ctx.tenantId,
      projectId: meeting.projectId,
      title,
      description: `משימת המשך לפגישה: ${meeting.title}`,
      createdById: ctx.auth.user.id,
      assignedToId,
      dueDate: dueDate ? new Date(dueDate) : null,
      linkedEntityType: 'meeting',
      linkedEntityId: meetingId,
    },
  });
});

export const sendInviteMutation = tenantProcedure.input(sendInviteSchema).mutation(async ({ ctx, input }) => {
  const meeting = await ctx.prisma.meeting.findFirst({
    where: { id: input.id, tenantId: ctx.tenantId },
    include: { project: { select: { name: true } }, client: { select: { name: true } } },
  });
  if (!meeting) throw new TRPCError({ code: 'NOT_FOUND', message: 'פגישה לא נמצאה' });

  // In production, this would send actual email invites
  // For now, return success with invite details
  return {
    success: true,
    sentTo: input.recipientEmails,
    meeting: { id: meeting.id, title: meeting.title, startTime: meeting.startTime, endTime: meeting.endTime },
  };
});
