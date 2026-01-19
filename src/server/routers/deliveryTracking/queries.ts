import { tenantProcedure } from '../../trpc';
import { listDeliveryTrackingSchema, getDeliveryTrackingByIdSchema } from './schemas';

export const listDeliveryTracking = tenantProcedure
  .input(listDeliveryTrackingSchema)
  .query(async ({ ctx, input }) => {
    const {
      page, pageSize, purchaseOrderId, supplierId,
      roomProductId, projectId, status, hasIssue, isOverdue, sortBy, sortOrder,
    } = input;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
      tenantId: ctx.tenantId,
      ...(purchaseOrderId && { purchaseOrderId }),
      ...(supplierId && { supplierId }),
      ...(roomProductId && { roomProductId }),
      ...(projectId && { purchaseOrder: { projectId } }),
      ...(status && { status }),
      ...(hasIssue !== undefined && { hasIssue }),
      ...(isOverdue && {
        estimatedDeliveryDate: { lt: today },
        actualDeliveryDate: null,
        status: { notIn: ['delivered', 'issue'] },
      }),
    };

    const [items, total] = await Promise.all([
      ctx.prisma.deliveryTracking.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { orderDate: 'desc' },
        include: {
          supplier: { select: { id: true, name: true } },
          purchaseOrder: { select: { id: true, orderNumber: true, project: { select: { id: true, name: true } } } },
          roomProduct: { select: { id: true, product: { select: { id: true, name: true, imageUrl: true } } } },
        },
      }),
      ctx.prisma.deliveryTracking.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

export const getDeliveryTrackingById = tenantProcedure
  .input(getDeliveryTrackingByIdSchema)
  .query(async ({ ctx, input }) => {
    return ctx.prisma.deliveryTracking.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
      include: {
        supplier: { select: { id: true, name: true, phone: true, email: true } },
        purchaseOrder: {
          select: {
            id: true,
            orderNumber: true,
            project: { select: { id: true, name: true } },
          },
        },
        roomProduct: {
          select: {
            id: true,
            product: { select: { id: true, name: true, imageUrl: true } },
            room: { select: { id: true, name: true } },
          },
        },
      },
    });
  });

export const getOverdue = tenantProcedure.query(async ({ ctx }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return ctx.prisma.deliveryTracking.findMany({
    where: {
      tenantId: ctx.tenantId,
      estimatedDeliveryDate: { lt: today },
      actualDeliveryDate: null,
      status: { notIn: ['delivered', 'issue'] },
    },
    orderBy: { estimatedDeliveryDate: 'asc' },
    include: {
      supplier: { select: { id: true, name: true } },
      purchaseOrder: { select: { id: true, orderNumber: true } },
      roomProduct: { select: { id: true, product: { select: { name: true } } } },
    },
  });
});

export const getExpectedThisWeek = tenantProcedure.query(async ({ ctx }) => {
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  return ctx.prisma.deliveryTracking.findMany({
    where: {
      tenantId: ctx.tenantId,
      estimatedDeliveryDate: { gte: today, lte: weekEnd },
      actualDeliveryDate: null,
      status: { notIn: ['delivered', 'issue'] },
    },
    orderBy: { estimatedDeliveryDate: 'asc' },
    include: {
      supplier: { select: { id: true, name: true } },
      purchaseOrder: { select: { id: true, orderNumber: true } },
      roomProduct: { select: { id: true, product: { select: { name: true } } } },
    },
  });
});

export const getWithIssues = tenantProcedure.query(async ({ ctx }) => {
  return ctx.prisma.deliveryTracking.findMany({
    where: {
      tenantId: ctx.tenantId,
      hasIssue: true,
      issueResolvedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      supplier: { select: { id: true, name: true } },
      purchaseOrder: { select: { id: true, orderNumber: true } },
      roomProduct: { select: { id: true, product: { select: { name: true } } } },
    },
  });
});

export const getStats = tenantProcedure.query(async ({ ctx }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [byStatus, overdue, withIssues, expectedThisWeek] = await Promise.all([
    ctx.prisma.deliveryTracking.groupBy({
      by: ['status'],
      where: { tenantId: ctx.tenantId },
      _count: { id: true },
    }),
    ctx.prisma.deliveryTracking.count({
      where: {
        tenantId: ctx.tenantId,
        estimatedDeliveryDate: { lt: today },
        actualDeliveryDate: null,
        status: { notIn: ['delivered', 'issue'] },
      },
    }),
    ctx.prisma.deliveryTracking.count({
      where: { tenantId: ctx.tenantId, hasIssue: true, issueResolvedAt: null },
    }),
    ctx.prisma.deliveryTracking.count({
      where: {
        tenantId: ctx.tenantId,
        estimatedDeliveryDate: { gte: today, lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) },
        actualDeliveryDate: null,
      },
    }),
  ]);

  return {
    byStatus: byStatus.reduce((acc: Record<string, number>, item: { status: string; _count: { id: number } }) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>),
    overdue,
    withIssues,
    expectedThisWeek,
  };
});
