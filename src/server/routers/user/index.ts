import { TRPCError } from '@trpc/server';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  userUpdateSchema, notificationSettingsSchema, roleUpdateSchema,
  permissionsUpdateSchema, userIdSchema, userDeactivateSchema,
} from './schemas';

const USER_SELECT = {
  id: true, email: true, firstName: true, lastName: true, phone: true,
  avatar: true, title: true, role: true, permissions: true,
  language: true, theme: true, notifications: true, lastLoginAt: true, createdAt: true,
};

export const userRouter = createTRPCRouter({
  me: tenantProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({ where: { id: ctx.auth.user.id }, select: USER_SELECT });
  }),

  updateProfile: tenantProcedure.input(userUpdateSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.user.update({ where: { id: ctx.auth.user.id }, data: input });
  }),

  updateNotifications: tenantProcedure.input(notificationSettingsSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.auth.user.id }, select: { notifications: true },
    });
    const current = (user?.notifications as object) || {};
    return ctx.prisma.user.update({
      where: { id: ctx.auth.user.id }, data: { notifications: { ...current, ...input } },
    });
  }),

  list: tenantProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        avatar: true, title: true, role: true, lastLoginAt: true, createdAt: true,
      },
      orderBy: [{ role: 'asc' }, { firstName: 'asc' }],
    });
  }),

  getById: tenantProcedure.input(userIdSchema).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        avatar: true, title: true, role: true, permissions: true, lastLoginAt: true, createdAt: true,
      },
    });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    return user;
  }),

  updateRole: tenantProcedure.input(roleUpdateSchema).mutation(async ({ ctx, input }) => {
    if (ctx.userRole !== 'owner') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only owners can change user roles' });
    }
    if (input.userId === ctx.auth.user.id) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot change your own role' });
    }
    const user = await ctx.prisma.user.findFirst({ where: { id: input.userId, tenantId: ctx.tenantId } });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    return ctx.prisma.user.update({ where: { id: input.userId }, data: { role: input.role } });
  }),

  updatePermissions: tenantProcedure.input(permissionsUpdateSchema).mutation(async ({ ctx, input }) => {
    if (ctx.userRole !== 'owner' && ctx.userRole !== 'manager') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only owners and managers can update permissions' });
    }
    if (input.userId === ctx.auth.user.id) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot change your own permissions' });
    }
    const user = await ctx.prisma.user.findFirst({
      where: { id: input.userId, tenantId: ctx.tenantId }, select: { permissions: true },
    });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    const current = (user.permissions as object) || {};
    return ctx.prisma.user.update({
      where: { id: input.userId }, data: { permissions: { ...current, ...input.permissions } },
    });
  }),

  deactivate: tenantProcedure.input(userDeactivateSchema).mutation(async ({ ctx, input }) => {
    if (ctx.userRole !== 'owner') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only owners can deactivate users' });
    }
    if (input.userId === ctx.auth.user.id) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot deactivate yourself' });
    }
    const user = await ctx.prisma.user.findFirst({ where: { id: input.userId, tenantId: ctx.tenantId } });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    return ctx.prisma.user.update({ where: { id: input.userId }, data: { isActive: false } });
  }),
});
