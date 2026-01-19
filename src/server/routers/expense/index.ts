/* eslint-disable complexity */
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import { createExpenseSchema, updateExpenseSchema, listExpensesSchema, expenseIdSchema, approveExpenseSchema, rejectExpenseSchema, uploadReceiptSchema } from './schemas';

export const expenseRouter = createTRPCRouter({
  list: tenantProcedure.input(listExpensesSchema).query(async ({ ctx, input }) => {
    const { projectId, categoryId, supplierId, status, isBillable, dateFrom, dateTo, search, page, pageSize } = input;
    const skip = (page - 1) * pageSize;
    const where: Prisma.ExpenseWhereInput = { tenantId: ctx.tenantId };

    if (projectId) where.projectId = projectId;
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    if (isBillable !== undefined) where.isBillable = isBillable;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }
    if (search) where.description = { contains: search, mode: 'insensitive' };

    const [expenses, total] = await Promise.all([
      ctx.prisma.expense.findMany({
        where, skip, take: pageSize, orderBy: { date: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
      ctx.prisma.expense.count({ where }),
    ]);

    return { items: expenses, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: page * pageSize < total } };
  }),

  getById: tenantProcedure.input(expenseIdSchema).query(async ({ ctx, input }) => {
    const expense = await ctx.prisma.expense.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
      include: {
        project: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
        supplier: { select: { id: true, name: true } },
      },
    });
    if (!expense) throw new TRPCError({ code: 'NOT_FOUND', message: 'הוצאה לא נמצאה' });
    return expense;
  }),

  create: tenantProcedure.input(createExpenseSchema).mutation(async ({ ctx, input }) => {
    const billedAmount = input.isBillable && input.markupPercent
      ? input.amount * (1 + input.markupPercent / 100)
      : input.isBillable ? input.amount : null;

    return ctx.prisma.expense.create({
      data: {
        tenantId: ctx.tenantId, projectId: input.projectId, description: input.description,
        amount: input.amount, currency: input.currency, date: new Date(input.date),
        categoryId: input.categoryId, supplierId: input.supplierId, isBillable: input.isBillable,
        markupPercent: input.markupPercent, billedAmount, receiptUrl: input.receiptUrl,
        invoiceNumber: input.invoiceNumber, createdById: ctx.auth.user.id,
      },
    });
  }),

  update: tenantProcedure.input(updateExpenseSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    const existing = await ctx.prisma.expense.findFirst({ where: { id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'הוצאה לא נמצאה' });
    if (existing.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן לערוך רק הוצאות בסטטוס ממתין' });

    const amount = data.amount ?? existing.amount;
    const isBillable = data.isBillable ?? existing.isBillable;
    const markupPercent = data.markupPercent ?? existing.markupPercent;
    const billedAmount = isBillable && markupPercent ? amount * (1 + markupPercent / 100) : isBillable ? amount : null;

    return ctx.prisma.expense.update({
      where: { id },
      data: { ...data, date: data.date ? new Date(data.date) : undefined, billedAmount },
    });
  }),

  delete: tenantProcedure.input(expenseIdSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.expense.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'הוצאה לא נמצאה' });
    if (existing.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן למחוק רק הוצאות בסטטוס ממתין' });
    return ctx.prisma.expense.delete({ where: { id: input.id } });
  }),

  approve: tenantProcedure.input(approveExpenseSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.expense.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'הוצאה לא נמצאה' });
    if (existing.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן לאשר רק הוצאות בסטטוס ממתין' });

    return ctx.prisma.expense.update({
      where: { id: input.id },
      data: { status: 'approved', approvedBy: ctx.auth.user.id, approvedAt: new Date() },
    });
  }),

  reject: tenantProcedure.input(rejectExpenseSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.expense.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'הוצאה לא נמצאה' });
    if (existing.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן לדחות רק הוצאות בסטטוס ממתין' });

    return ctx.prisma.expense.update({ where: { id: input.id }, data: { status: 'rejected' } });
  }),

  uploadReceipt: tenantProcedure.input(uploadReceiptSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.expense.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'הוצאה לא נמצאה' });

    return ctx.prisma.expense.update({ where: { id: input.id }, data: { receiptUrl: input.receiptUrl } });
  }),

  summary: tenantProcedure.input(listExpensesSchema.pick({ projectId: true, dateFrom: true, dateTo: true })).query(async ({ ctx, input }) => {
    const where: Prisma.ExpenseWhereInput = { tenantId: ctx.tenantId };
    if (input.projectId) where.projectId = input.projectId;
    if (input.dateFrom || input.dateTo) {
      where.date = {};
      if (input.dateFrom) where.date.gte = new Date(input.dateFrom);
      if (input.dateTo) where.date.lte = new Date(input.dateTo);
    }

    const [total, approved, billable, totalAmount, billableAmount] = await Promise.all([
      ctx.prisma.expense.count({ where }),
      ctx.prisma.expense.count({ where: { ...where, status: 'approved' } }),
      ctx.prisma.expense.count({ where: { ...where, isBillable: true } }),
      ctx.prisma.expense.aggregate({ where, _sum: { amount: true } }),
      ctx.prisma.expense.aggregate({ where: { ...where, isBillable: true }, _sum: { billedAmount: true } }),
    ]);

    return { total, approved, billable, totalAmount: totalAmount._sum.amount ?? 0, billableAmount: billableAmount._sum.billedAmount ?? 0 };
  }),

  byCategory: tenantProcedure.input(listExpensesSchema.pick({ projectId: true, dateFrom: true, dateTo: true })).query(async ({ ctx, input }) => {
    const where: Prisma.ExpenseWhereInput = { tenantId: ctx.tenantId, categoryId: { not: null } };
    if (input.projectId) where.projectId = input.projectId;
    if (input.dateFrom || input.dateTo) {
      where.date = {};
      if (input.dateFrom) where.date.gte = new Date(input.dateFrom);
      if (input.dateTo) where.date.lte = new Date(input.dateTo);
    }

    const expenses = await ctx.prisma.expense.groupBy({ by: ['categoryId'], where, _sum: { amount: true }, _count: true });
    const categoryIds = expenses.map((e) => e.categoryId).filter(Boolean) as string[];
    const categories = await ctx.prisma.configurableEntity.findMany({ where: { id: { in: categoryIds } } });
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return expenses.map((e) => ({
      categoryId: e.categoryId,
      categoryName: e.categoryId ? categoryMap.get(e.categoryId)?.name ?? 'לא ידוע' : 'ללא קטגוריה',
      totalAmount: e._sum.amount ?? 0,
      count: e._count,
    }));
  }),
});
