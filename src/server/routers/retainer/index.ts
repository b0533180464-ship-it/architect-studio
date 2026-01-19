import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import { createRetainerSchema, updateRetainerSchema, listRetainersSchema, retainerIdSchema, receiveRetainerSchema, applyRetainerSchema, refundRetainerSchema } from './schemas';

export const retainerRouter = createTRPCRouter({
  list: tenantProcedure.input(listRetainersSchema).query(async ({ ctx, input }) => {
    const { clientId, projectId, status, page, pageSize } = input;
    const skip = (page - 1) * pageSize;
    const where: Prisma.RetainerWhereInput = { tenantId: ctx.tenantId };

    if (clientId) where.clientId = clientId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const [retainers, total] = await Promise.all([
      ctx.prisma.retainer.findMany({
        where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          _count: { select: { applications: true } },
        },
      }),
      ctx.prisma.retainer.count({ where }),
    ]);

    return { items: retainers, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: page * pageSize < total } };
  }),

  getById: tenantProcedure.input(retainerIdSchema).query(async ({ ctx, input }) => {
    const retainer = await ctx.prisma.retainer.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        applications: { orderBy: { appliedAt: 'desc' }, include: { payment: { select: { id: true, name: true } } } },
      },
    });
    if (!retainer) throw new TRPCError({ code: 'NOT_FOUND', message: 'מקדמה לא נמצאה' });
    return retainer;
  }),

  create: tenantProcedure.input(createRetainerSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.retainer.create({
      data: {
        tenantId: ctx.tenantId, clientId: input.clientId, projectId: input.projectId,
        type: input.type, amount: input.amount, currency: input.currency,
        amountRemaining: input.amount, notes: input.notes,
      },
    });
  }),

  update: tenantProcedure.input(updateRetainerSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    const existing = await ctx.prisma.retainer.findFirst({ where: { id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מקדמה לא נמצאה' });
    if (existing.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן לערוך רק מקדמות בסטטוס ממתין' });

    const updateData: Prisma.RetainerUpdateInput = { ...data };
    if (data.amount !== undefined) {
      updateData.amountRemaining = data.amount - existing.amountApplied;
    }

    return ctx.prisma.retainer.update({ where: { id }, data: updateData });
  }),

  delete: tenantProcedure.input(retainerIdSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.retainer.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מקדמה לא נמצאה' });
    if (existing.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן למחוק רק מקדמות בסטטוס ממתין' });
    return ctx.prisma.retainer.delete({ where: { id: input.id } });
  }),

  receive: tenantProcedure.input(receiveRetainerSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.retainer.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מקדמה לא נמצאה' });
    if (existing.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'המקדמה כבר התקבלה' });

    return ctx.prisma.retainer.update({
      where: { id: input.id },
      data: {
        status: 'received',
        receivedAt: input.receivedAt ? new Date(input.receivedAt) : new Date(),
        paymentMethod: input.paymentMethod,
        referenceNumber: input.referenceNumber,
      },
    });
  }),

  applyToPayment: tenantProcedure.input(applyRetainerSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.retainer.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מקדמה לא נמצאה' });
    if (existing.status === 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'המקדמה טרם התקבלה' });
    if (existing.status === 'fully_applied' || existing.status === 'refunded') throw new TRPCError({ code: 'BAD_REQUEST', message: 'אין יתרה זמינה במקדמה' });
    if (input.amount > existing.amountRemaining) throw new TRPCError({ code: 'BAD_REQUEST', message: 'הסכום גדול מהיתרה הזמינה' });

    const newApplied = existing.amountApplied + input.amount;
    const newRemaining = existing.amount - newApplied;
    const newStatus = newRemaining === 0 ? 'fully_applied' : 'partially_applied';

    const [retainer] = await ctx.prisma.$transaction([
      ctx.prisma.retainer.update({
        where: { id: input.id },
        data: { amountApplied: newApplied, amountRemaining: newRemaining, status: newStatus },
      }),
      ctx.prisma.retainerApplication.create({
        data: {
          retainerId: input.id, amount: input.amount, paymentId: input.paymentId,
          invoiceId: input.invoiceId, notes: input.notes, appliedBy: ctx.auth.user.id,
        },
      }),
    ]);

    return retainer;
  }),

  refund: tenantProcedure.input(refundRetainerSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.retainer.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מקדמה לא נמצאה' });
    if (existing.amountRemaining === 0) throw new TRPCError({ code: 'BAD_REQUEST', message: 'אין יתרה להחזר' });

    const refundAmount = input.amount ?? existing.amountRemaining;
    if (refundAmount > existing.amountRemaining) throw new TRPCError({ code: 'BAD_REQUEST', message: 'סכום ההחזר גדול מהיתרה' });

    return ctx.prisma.retainer.update({
      where: { id: input.id },
      data: { status: 'refunded', amountRemaining: existing.amountRemaining - refundAmount, notes: input.notes ? `${existing.notes ?? ''}\nהחזר: ${input.notes}` : existing.notes },
    });
  }),

  getStats: tenantProcedure.query(async ({ ctx }) => {
    const [total, pending, received, totalAmount, appliedAmount] = await Promise.all([
      ctx.prisma.retainer.count({ where: { tenantId: ctx.tenantId } }),
      ctx.prisma.retainer.count({ where: { tenantId: ctx.tenantId, status: 'pending' } }),
      ctx.prisma.retainer.count({ where: { tenantId: ctx.tenantId, status: { in: ['received', 'partially_applied'] } } }),
      ctx.prisma.retainer.aggregate({ where: { tenantId: ctx.tenantId }, _sum: { amount: true } }),
      ctx.prisma.retainer.aggregate({ where: { tenantId: ctx.tenantId }, _sum: { amountApplied: true } }),
    ]);
    return { total, pending, received, totalAmount: totalAmount._sum.amount ?? 0, appliedAmount: appliedAmount._sum.amountApplied ?? 0, availableAmount: (totalAmount._sum.amount ?? 0) - (appliedAmount._sum.amountApplied ?? 0) };
  }),
});
