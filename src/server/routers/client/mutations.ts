import { TRPCError } from '@trpc/server';
import { tenantProcedure } from '../../trpc';
import { createClientSchema, updateClientSchema, deleteClientSchema } from './schemas';

export const createMutation = tenantProcedure.input(createClientSchema).mutation(async ({ ctx, input }) => {
  const data = {
    ...input,
    email: input.email === '' ? null : input.email,
    anniversaryDate: input.anniversaryDate ? new Date(input.anniversaryDate) : null,
    importantDates: input.importantDates || [],
  };

  if (input.referredByClientId) {
    const referrer = await ctx.prisma.client.findFirst({ where: { id: input.referredByClientId, tenantId: ctx.tenantId } });
    if (!referrer) throw new TRPCError({ code: 'BAD_REQUEST', message: 'הלקוח המפנה לא נמצא' });
  }

  return ctx.prisma.client.create({ data: { ...data, tenantId: ctx.tenantId } });
});

export const updateMutation = tenantProcedure.input(updateClientSchema).mutation(async ({ ctx, input }) => {
  const { id, ...data } = input;

  const existing = await ctx.prisma.client.findFirst({ where: { id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'לקוח לא נמצא' });

  const updateData = {
    ...data,
    email: data.email === '' ? null : data.email,
    anniversaryDate: data.anniversaryDate ? new Date(data.anniversaryDate) : undefined,
  };

  if (data.referredByClientId) {
    const referrer = await ctx.prisma.client.findFirst({ where: { id: data.referredByClientId, tenantId: ctx.tenantId } });
    if (!referrer) throw new TRPCError({ code: 'BAD_REQUEST', message: 'הלקוח המפנה לא נמצא' });
  }

  return ctx.prisma.client.update({ where: { id }, data: updateData });
});

export const deleteMutation = tenantProcedure.input(deleteClientSchema).mutation(async ({ ctx, input }) => {
  const { id } = input;

  const existing = await ctx.prisma.client.findFirst({ where: { id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'לקוח לא נמצא' });

  const activeProjects = await ctx.prisma.project.count({ where: { clientId: id, tenantId: ctx.tenantId, archivedAt: null } });
  if (activeProjects > 0) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: `לא ניתן למחוק לקוח עם ${activeProjects} פרויקטים פעילים` });
  }

  return ctx.prisma.client.update({ where: { id }, data: { isActive: false } });
});
