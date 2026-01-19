import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { tenantProcedure } from '../../trpc';
import { listMeetingsSchema, calendarViewSchema, getMeetingByIdSchema } from './schemas';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} דקות`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return hours === 1 ? 'שעה' : `${hours} שעות`;
  return `${hours} שעות ${mins} דקות`;
}

export const listQuery = tenantProcedure.input(listMeetingsSchema).query(async ({ ctx, input }) => {
  const { projectId, clientId, meetingType, status, startDate, endDate, page, pageSize } = input;
  const skip = (page - 1) * pageSize;

  const where: Prisma.MeetingWhereInput = { tenantId: ctx.tenantId };
  if (projectId) where.projectId = projectId;
  if (clientId) where.clientId = clientId;
  if (meetingType) where.meetingType = meetingType;
  if (status) where.status = status;
  if (startDate) where.startTime = { gte: new Date(startDate) };
  if (endDate) where.endTime = { ...where.endTime as object, lte: new Date(endDate) };

  const [meetings, total] = await Promise.all([
    ctx.prisma.meeting.findMany({
      where, skip, take: pageSize, orderBy: { startTime: 'asc' },
      include: {
        project: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    ctx.prisma.meeting.count({ where }),
  ]);

  const now = new Date();
  const meetingsWithComputed = meetings.map((meeting) => {
    const durationMinutes = Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60));
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const meetingDate = new Date(meeting.startTime.getFullYear(), meeting.startTime.getMonth(), meeting.startTime.getDate());
    return {
      ...meeting,
      computed: {
        duration: durationMinutes, durationFormatted: formatDuration(durationMinutes),
        isUpcoming: meeting.startTime > now, isPast: meeting.endTime < now,
        isToday: meetingDate.getTime() === today.getTime(),
        attendeesCount: meeting.attendeeUserIds.length + meeting.externalAttendees.length,
        isRecurring: !!meeting.recurrence,
      },
    };
  });

  return { items: meetingsWithComputed, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: page * pageSize < total } };
});

export const calendarQuery = tenantProcedure.input(calendarViewSchema).query(async ({ ctx, input }) => {
  const { year, month } = input;
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const meetings = await ctx.prisma.meeting.findMany({
    where: { tenantId: ctx.tenantId, OR: [{ startTime: { gte: startOfMonth, lte: endOfMonth } }, { endTime: { gte: startOfMonth, lte: endOfMonth } }] },
    orderBy: { startTime: 'asc' },
    include: { project: { select: { id: true, name: true } }, client: { select: { id: true, name: true } } },
  });

  const byDate: Record<string, typeof meetings> = {};
  for (const meeting of meetings) {
    const dateKey = meeting.startTime.toISOString().split('T')[0] || '';
    if (!byDate[dateKey]) byDate[dateKey] = [];
    byDate[dateKey]!.push(meeting);
  }

  return { year, month, meetings, byDate };
});

export const todayQuery = tenantProcedure.query(async ({ ctx }) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  return ctx.prisma.meeting.findMany({
    where: { tenantId: ctx.tenantId, startTime: { gte: startOfDay, lte: endOfDay }, status: { notIn: ['cancelled'] } },
    orderBy: { startTime: 'asc' },
    include: { project: { select: { id: true, name: true } }, client: { select: { id: true, name: true } } },
  });
});

export const upcomingQuery = tenantProcedure.query(async ({ ctx }) => {
  const now = new Date();
  return ctx.prisma.meeting.findMany({
    where: { tenantId: ctx.tenantId, startTime: { gte: now }, status: { notIn: ['cancelled', 'completed'] } },
    orderBy: { startTime: 'asc' }, take: 10,
    include: { project: { select: { id: true, name: true } }, client: { select: { id: true, name: true } } },
  });
});

export const getByIdQuery = tenantProcedure.input(getMeetingByIdSchema).query(async ({ ctx, input }) => {
  const meeting = await ctx.prisma.meeting.findFirst({
    where: { id: input.id, tenantId: ctx.tenantId },
    include: {
      project: { select: { id: true, name: true } },
      client: { select: { id: true, name: true, phone: true, email: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!meeting) throw new TRPCError({ code: 'NOT_FOUND', message: 'פגישה לא נמצאה' });

  const attendees = meeting.attendeeUserIds.length > 0
    ? await ctx.prisma.user.findMany({ where: { id: { in: meeting.attendeeUserIds }, tenantId: ctx.tenantId }, select: { id: true, firstName: true, lastName: true, email: true, avatar: true } })
    : [];

  const now = new Date();
  const durationMinutes = Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60));

  return {
    ...meeting, attendees,
    computed: {
      duration: durationMinutes, durationFormatted: formatDuration(durationMinutes),
      isUpcoming: meeting.startTime > now, isPast: meeting.endTime < now,
      attendeesCount: meeting.attendeeUserIds.length + meeting.externalAttendees.length,
      isRecurring: !!meeting.recurrence,
    },
  };
});

export const getStatsQuery = tenantProcedure.query(async ({ ctx }) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const [total, thisWeek, upcoming, byType] = await Promise.all([
    ctx.prisma.meeting.count({ where: { tenantId: ctx.tenantId } }),
    ctx.prisma.meeting.count({ where: { tenantId: ctx.tenantId, startTime: { gte: startOfWeek, lt: endOfWeek } } }),
    ctx.prisma.meeting.count({ where: { tenantId: ctx.tenantId, startTime: { gte: now }, status: { notIn: ['cancelled', 'completed'] } } }),
    ctx.prisma.meeting.groupBy({ by: ['meetingType'], where: { tenantId: ctx.tenantId }, _count: true }),
  ]);

  return { total, thisWeek, upcoming, byType: Object.fromEntries(byType.map((t) => [t.meetingType, t._count])) };
});
