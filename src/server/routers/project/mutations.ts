/* eslint-disable complexity */
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { tenantProcedure } from '../../trpc';
import { createProjectSchema, updateProjectSchema, deleteProjectSchema, archiveProjectSchema, assignUsersSchema, updatePermitSchema } from './schemas';

// Create new project
export const create = tenantProcedure.input(createProjectSchema).mutation(async ({ ctx, input }) => {
  const client = await ctx.prisma.client.findFirst({ where: { id: input.clientId, tenantId: ctx.tenantId, isActive: true } });
  if (!client) throw new TRPCError({ code: 'BAD_REQUEST', message: 'הלקוח לא נמצא או לא פעיל' });

  if (input.referredByClientId) {
    const referrer = await ctx.prisma.client.findFirst({ where: { id: input.referredByClientId, tenantId: ctx.tenantId } });
    if (!referrer) throw new TRPCError({ code: 'BAD_REQUEST', message: 'הלקוח המפנה לא נמצא' });
  }

  if (input.assignedUserIds?.length) {
    const validUsers = await ctx.prisma.user.count({ where: { id: { in: input.assignedUserIds }, tenantId: ctx.tenantId, isActive: true } });
    if (validUsers !== input.assignedUserIds.length) throw new TRPCError({ code: 'BAD_REQUEST', message: 'חלק מהמשתמשים לא נמצאו' });
  }

  const data = {
    ...input, assignedUserIds: undefined,
    startDate: input.startDate ? new Date(input.startDate) : null,
    expectedEndDate: input.expectedEndDate ? new Date(input.expectedEndDate) : null,
    constructionStartDate: input.constructionStartDate ? new Date(input.constructionStartDate) : null,
    constructionEndDate: input.constructionEndDate ? new Date(input.constructionEndDate) : null,
    installationDate: input.installationDate ? new Date(input.installationDate) : null,
  };

  return ctx.prisma.project.create({
    data: { ...data, tenantId: ctx.tenantId, createdById: ctx.auth.user.id, assignedUsers: input.assignedUserIds?.length ? { connect: input.assignedUserIds.map((id) => ({ id })) } : undefined },
    include: { client: { select: { id: true, name: true } }, assignedUsers: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });
});

// Update project
export const update = tenantProcedure.input(updateProjectSchema).mutation(async ({ ctx, input }) => {
  const { id, assignedUserIds, ...data } = input;
  const existing = await ctx.prisma.project.findFirst({ where: { id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });

  if (data.clientId && data.clientId !== existing.clientId) {
    const client = await ctx.prisma.client.findFirst({ where: { id: data.clientId, tenantId: ctx.tenantId, isActive: true } });
    if (!client) throw new TRPCError({ code: 'BAD_REQUEST', message: 'הלקוח לא נמצא או לא פעיל' });
  }

  const updateData: Prisma.ProjectUpdateInput = {
    ...data,
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate) : undefined,
    constructionStartDate: data.constructionStartDate ? new Date(data.constructionStartDate) : undefined,
    constructionEndDate: data.constructionEndDate ? new Date(data.constructionEndDate) : undefined,
    installationDate: data.installationDate ? new Date(data.installationDate) : undefined,
  };

  if (assignedUserIds !== undefined) {
    if (assignedUserIds.length) {
      const validUsers = await ctx.prisma.user.count({ where: { id: { in: assignedUserIds }, tenantId: ctx.tenantId, isActive: true } });
      if (validUsers !== assignedUserIds.length) throw new TRPCError({ code: 'BAD_REQUEST', message: 'חלק מהמשתמשים לא נמצאו' });
    }
    updateData.assignedUsers = { set: assignedUserIds.map((userId) => ({ id: userId })) };
  }

  return ctx.prisma.project.update({
    where: { id }, data: updateData,
    include: { client: { select: { id: true, name: true } }, assignedUsers: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });
});

// Soft delete project
export const deleteProject = tenantProcedure.input(deleteProjectSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.project.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });
  if (ctx.userRole !== 'owner' && ctx.userRole !== 'manager') throw new TRPCError({ code: 'FORBIDDEN', message: 'אין הרשאה למחיקת פרויקטים' });
  return ctx.prisma.project.update({ where: { id: input.id }, data: { archivedAt: new Date() } });
});

// Archive project
export const archive = tenantProcedure.input(archiveProjectSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.project.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });
  if (existing.archivedAt) throw new TRPCError({ code: 'BAD_REQUEST', message: 'הפרויקט כבר בארכיון' });
  return ctx.prisma.project.update({ where: { id: input.id }, data: { archivedAt: new Date() } });
});

// Restore project from archive
export const restore = tenantProcedure.input(archiveProjectSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.project.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });
  if (!existing.archivedAt) throw new TRPCError({ code: 'BAD_REQUEST', message: 'הפרויקט לא בארכיון' });
  return ctx.prisma.project.update({ where: { id: input.id }, data: { archivedAt: null } });
});

// Assign/update users on project
export const assignUsers = tenantProcedure.input(assignUsersSchema).mutation(async ({ ctx, input }) => {
  const { projectId, userIds, replace } = input;
  const existing = await ctx.prisma.project.findFirst({ where: { id: projectId, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });

  if (userIds.length) {
    const validUsers = await ctx.prisma.user.count({ where: { id: { in: userIds }, tenantId: ctx.tenantId, isActive: true } });
    if (validUsers !== userIds.length) throw new TRPCError({ code: 'BAD_REQUEST', message: 'חלק מהמשתמשים לא נמצאו' });
  }

  return ctx.prisma.project.update({
    where: { id: projectId },
    data: { assignedUsers: replace ? { set: userIds.map((id) => ({ id })) } : { connect: userIds.map((id) => ({ id })) } },
    include: { assignedUsers: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });
});

// Update permit status
export const updatePermit = tenantProcedure.input(updatePermitSchema).mutation(async ({ ctx, input }) => {
  const { id, permitSubmittedAt, permitApprovedAt, ...data } = input;
  const existing = await ctx.prisma.project.findFirst({ where: { id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });

  return ctx.prisma.project.update({
    where: { id },
    data: { ...data, permitSubmittedAt: permitSubmittedAt ? new Date(permitSubmittedAt) : undefined, permitApprovedAt: permitApprovedAt ? new Date(permitApprovedAt) : undefined },
  });
});
