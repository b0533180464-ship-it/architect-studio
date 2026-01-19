import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import { createPaymentSchema, updatePaymentSchema, listPaymentsSchema, paymentIdSchema, markPaidSchema, partialPaymentSchema, sendReminderSchema } from './schemas';

export const paymentRouter = createTRPCRouter({
  list: tenantProcedure.input(listPaymentsSchema).query(async ({ ctx, input }) => {
    const { projectId, status, paymentType, overdue, page, pageSize } = input;
    const skip = (page - 1) * pageSize;
    const where: Prisma.PaymentWhereInput = { tenantId: ctx.tenantId };

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (paymentType) where.paymentType = paymentType;
    if (overdue) { const today = new Date(); today.setHours(0, 0, 0, 0); where.dueDate = { lt: today }; where.status = { in: ['scheduled', 'pending', 'invoiced', 'partial'] }; }

    const [payments, total] = await Promise.all([
      ctx.prisma.payment.findMany({
        where, skip, take: pageSize, orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { order: 'asc' }],
        include: { project: { select: { id: true, name: true, client: { select: { id: true, name: true } } } } },
      }),
      ctx.prisma.payment.count({ where }),
    ]);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const paymentsWithComputed = payments.map((p) => ({
      ...p,
      computed: {
        remainingAmount: p.amount - p.paidAmount,
        paidPercentage: Math.round((p.paidAmount / p.amount) * 100),
        isOverdue: p.dueDate ? p.dueDate < today && !['paid', 'cancelled'].includes(p.status) : false,
        daysOverdue: p.dueDate && p.dueDate < today ? Math.ceil((today.getTime() - p.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : null,
        daysUntilDue: p.dueDate && p.dueDate >= today ? Math.ceil((p.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null,
      },
    }));

    return { items: paymentsWithComputed, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: page * pageSize < total } };
  }),

  getById: tenantProcedure.input(paymentIdSchema).query(async ({ ctx, input }) => {
    const payment = await ctx.prisma.payment.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
      include: { project: { select: { id: true, name: true, client: { select: { id: true, name: true, email: true } } } }, retainerApplications: true },
    });
    if (!payment) throw new TRPCError({ code: 'NOT_FOUND', message: 'תשלום לא נמצא' });
    return payment;
  }),

  create: tenantProcedure.input(createPaymentSchema).mutation(async ({ ctx, input }) => {
    const maxOrder = await ctx.prisma.payment.aggregate({ where: { projectId: input.projectId }, _max: { order: true } });
    return ctx.prisma.payment.create({
      data: {
        tenantId: ctx.tenantId, projectId: input.projectId, name: input.name, description: input.description,
        amount: input.amount, currency: input.currency, paymentType: input.paymentType,
        milestonePhaseId: input.milestonePhaseId, milestoneDescription: input.milestoneDescription,
        percentageOfBudget: input.percentageOfBudget, hoursWorked: input.hoursWorked, hourlyRate: input.hourlyRate,
        changeOrderId: input.changeOrderId, dueDate: input.dueDate ? new Date(input.dueDate) : null,
        triggerType: input.triggerType, triggerDescription: input.triggerDescription,
        order: input.order ?? (maxOrder._max.order ?? 0) + 1,
      },
    });
  }),

  update: tenantProcedure.input(updatePaymentSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    const existing = await ctx.prisma.payment.findFirst({ where: { id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'תשלום לא נמצא' });
    return ctx.prisma.payment.update({ where: { id }, data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : undefined } });
  }),

  delete: tenantProcedure.input(paymentIdSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.payment.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'תשלום לא נמצא' });
    if (existing.paidAmount > 0) throw new TRPCError({ code: 'BAD_REQUEST', message: 'לא ניתן למחוק תשלום שכבר שולם חלקית' });
    return ctx.prisma.payment.delete({ where: { id: input.id } });
  }),

  markPaid: tenantProcedure.input(markPaidSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.payment.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'תשלום לא נמצא' });

    const paidAmount = input.paidAmount ?? existing.amount;
    return ctx.prisma.payment.update({
      where: { id: input.id },
      data: {
        paidAmount, status: 'paid', paidDate: input.paidDate ? new Date(input.paidDate) : new Date(),
        paymentMethod: input.paymentMethod, referenceNumber: input.referenceNumber,
      },
    });
  }),

  partialPayment: tenantProcedure.input(partialPaymentSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.payment.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'תשלום לא נמצא' });

    const newPaidAmount = existing.paidAmount + input.amount;
    if (newPaidAmount > existing.amount) throw new TRPCError({ code: 'BAD_REQUEST', message: 'סכום התשלום גדול מהיתרה לתשלום' });

    const status = newPaidAmount >= existing.amount ? 'paid' : 'partial';
    return ctx.prisma.payment.update({
      where: { id: input.id },
      data: {
        paidAmount: newPaidAmount, status, paidDate: input.paidDate ? new Date(input.paidDate) : new Date(),
        paymentMethod: input.paymentMethod, referenceNumber: input.referenceNumber,
      },
    });
  }),

  sendReminder: tenantProcedure.input(sendReminderSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.payment.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'תשלום לא נמצא' });

    // TODO: Send email reminder
    return ctx.prisma.payment.update({
      where: { id: input.id },
      data: { remindersSent: { increment: 1 }, lastReminderAt: new Date() },
    });
  }),

  overdue: tenantProcedure.query(async ({ ctx }) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return ctx.prisma.payment.findMany({
      where: { tenantId: ctx.tenantId, dueDate: { lt: today }, status: { in: ['scheduled', 'pending', 'invoiced', 'partial'] } },
      orderBy: { dueDate: 'asc' },
      include: { project: { select: { id: true, name: true, client: { select: { id: true, name: true } } } } },
    });
  }),

  upcoming: tenantProcedure.query(async ({ ctx }) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const nextMonth = new Date(today); nextMonth.setMonth(nextMonth.getMonth() + 1);
    return ctx.prisma.payment.findMany({
      where: { tenantId: ctx.tenantId, dueDate: { gte: today, lt: nextMonth }, status: { in: ['scheduled', 'pending', 'invoiced'] } },
      orderBy: { dueDate: 'asc' },
      include: { project: { select: { id: true, name: true, client: { select: { id: true, name: true } } } } },
    });
  }),

  getStats: tenantProcedure.query(async ({ ctx }) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [total, paid, pending, overdue, totalAmount, paidAmount] = await Promise.all([
      ctx.prisma.payment.count({ where: { tenantId: ctx.tenantId } }),
      ctx.prisma.payment.count({ where: { tenantId: ctx.tenantId, status: 'paid' } }),
      ctx.prisma.payment.count({ where: { tenantId: ctx.tenantId, status: { in: ['scheduled', 'pending', 'invoiced', 'partial'] } } }),
      ctx.prisma.payment.count({ where: { tenantId: ctx.tenantId, dueDate: { lt: today }, status: { in: ['scheduled', 'pending', 'invoiced', 'partial'] } } }),
      ctx.prisma.payment.aggregate({ where: { tenantId: ctx.tenantId }, _sum: { amount: true } }),
      ctx.prisma.payment.aggregate({ where: { tenantId: ctx.tenantId }, _sum: { paidAmount: true } }),
    ]);
    return { total, paid, pending, overdue, totalAmount: totalAmount._sum.amount ?? 0, paidAmount: paidAmount._sum.paidAmount ?? 0, remainingAmount: (totalAmount._sum.amount ?? 0) - (paidAmount._sum.paidAmount ?? 0) };
  }),
});
