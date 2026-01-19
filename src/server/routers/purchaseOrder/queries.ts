import { tenantProcedure } from '../../trpc';
import { listPurchaseOrdersSchema, getPurchaseOrderByIdSchema } from './schemas';

export const listPurchaseOrders = tenantProcedure
  .input(listPurchaseOrdersSchema)
  .query(async ({ ctx, input }) => {
    const { page, pageSize, projectId, supplierId, status, search, sortBy, sortOrder } = input;

    const where = {
      tenantId: ctx.tenantId,
      ...(projectId && { projectId }),
      ...(supplierId && { supplierId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' as const } },
          { vendorOrderNumber: { contains: search, mode: 'insensitive' as const } },
          { notes: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      ctx.prisma.purchaseOrder.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { orderDate: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      ctx.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

export const getPurchaseOrderById = tenantProcedure
  .input(getPurchaseOrderByIdSchema)
  .query(async ({ ctx, input }) => {
    return ctx.prisma.purchaseOrder.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
      include: {
        project: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          orderBy: { order: 'asc' },
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
            roomProduct: { select: { id: true } },
            room: { select: { id: true, name: true } },
          },
        },
      },
    });
  });

export const getStats = tenantProcedure.query(async ({ ctx }) => {
  const [byStatus, totalAmount, thisMonth] = await Promise.all([
    ctx.prisma.purchaseOrder.groupBy({
      by: ['status'],
      where: { tenantId: ctx.tenantId },
      _count: { id: true },
    }),
    ctx.prisma.purchaseOrder.aggregate({
      where: { tenantId: ctx.tenantId, status: { notIn: ['cancelled', 'draft'] } },
      _sum: { total: true },
    }),
    ctx.prisma.purchaseOrder.aggregate({
      where: {
        tenantId: ctx.tenantId,
        orderDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        status: { notIn: ['cancelled', 'draft'] },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
  ]);

  return {
    byStatus: byStatus.reduce((acc: Record<string, number>, item: { status: string; _count: { id: number } }) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>),
    totalAmount: totalAmount._sum.total || 0,
    thisMonth: {
      count: thisMonth._count.id,
      total: thisMonth._sum.total || 0,
    },
  };
});
