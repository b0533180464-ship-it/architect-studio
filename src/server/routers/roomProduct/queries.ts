import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { tenantProcedure } from '../../trpc';
import { listRoomProductsSchema, getRoomProductByIdSchema, ffeScheduleSchema } from './schemas';

export const listRoomProducts = tenantProcedure
  .input(listRoomProductsSchema)
  .query(async ({ ctx, input }) => {
    const {
      projectId,
      roomId,
      page,
      pageSize,
      clientApprovalStatus,
      procurementStatus,
      hasIssue,
      supplierId,
      sortBy,
      sortOrder,
    } = input;
    const skip = (page - 1) * pageSize;

    const where: Prisma.RoomProductWhereInput = { tenantId: ctx.tenantId, projectId };

    if (roomId) where.roomId = roomId;
    if (clientApprovalStatus) where.clientApprovalStatus = clientApprovalStatus;
    if (procurementStatus) where.procurementStatus = procurementStatus;
    if (hasIssue !== undefined) where.hasIssue = hasIssue;
    if (supplierId) where.product = { supplierId };

    const orderBy: Prisma.RoomProductOrderByWithRelationInput =
      sortBy === 'productName' ? { product: { name: sortOrder } } : { [sortBy]: sortOrder };

    const [roomProducts, total] = await Promise.all([
      ctx.prisma.roomProduct.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          product: { include: { supplier: { select: { id: true, name: true } } } },
          room: { select: { id: true, name: true } },
        },
      }),
      ctx.prisma.roomProduct.count({ where }),
    ]);

    return {
      items: roomProducts.map((rp) => ({
        ...rp,
        totalCost: rp.costPrice * rp.quantity,
        totalClientPrice: rp.clientPrice * rp.quantity,
        profit: (rp.clientPrice - rp.costPrice) * rp.quantity,
        profitMargin:
          rp.clientPrice > 0 ? ((rp.clientPrice - rp.costPrice) / rp.clientPrice) * 100 : 0,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasMore: page * pageSize < total,
      },
    };
  });

export const getRoomProductById = tenantProcedure
  .input(getRoomProductByIdSchema)
  .query(async ({ ctx, input }) => {
    const { id } = input;

    const roomProduct = await ctx.prisma.roomProduct.findFirst({
      where: { id, tenantId: ctx.tenantId },
      include: {
        product: { include: { supplier: { select: { id: true, name: true, email: true, phone: true } } } },
        room: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!roomProduct) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא בחדר' });
    }

    return {
      ...roomProduct,
      totalCost: roomProduct.costPrice * roomProduct.quantity,
      totalClientPrice: roomProduct.clientPrice * roomProduct.quantity,
      profit: (roomProduct.clientPrice - roomProduct.costPrice) * roomProduct.quantity,
      profitMargin:
        roomProduct.clientPrice > 0
          ? ((roomProduct.clientPrice - roomProduct.costPrice) / roomProduct.clientPrice) * 100
          : 0,
    };
  });

export const ffeSchedule = tenantProcedure.input(ffeScheduleSchema).query(async ({ ctx, input }) => {
  const { projectId, roomId, categoryId, supplierId, clientApprovalStatus, procurementStatus, hasIssue } =
    input;

  const where: Prisma.RoomProductWhereInput = { tenantId: ctx.tenantId, projectId };

  if (roomId) where.roomId = roomId;
  if (clientApprovalStatus) where.clientApprovalStatus = clientApprovalStatus;
  if (procurementStatus) where.procurementStatus = procurementStatus;
  if (hasIssue !== undefined) where.hasIssue = hasIssue;
  if (categoryId || supplierId) {
    where.product = {};
    if (categoryId) where.product.categoryId = categoryId;
    if (supplierId) where.product.supplierId = supplierId;
  }

  const [roomProducts, rooms, project] = await Promise.all([
    ctx.prisma.roomProduct.findMany({
      where,
      orderBy: [{ room: { order: 'asc' } }, { order: 'asc' }],
      include: {
        product: { include: { supplier: { select: { id: true, name: true } } } },
        room: { select: { id: true, name: true } },
      },
    }),
    ctx.prisma.room.findMany({
      where: { projectId, tenantId: ctx.tenantId },
      orderBy: { order: 'asc' },
    }),
    ctx.prisma.project.findFirst({
      where: { id: projectId, tenantId: ctx.tenantId },
      select: { id: true, name: true },
    }),
  ]);

  const summary = {
    totalProducts: roomProducts.length,
    totalCost: roomProducts.reduce((acc, rp) => acc + rp.costPrice * rp.quantity, 0),
    totalClientPrice: roomProducts.reduce((acc, rp) => acc + rp.clientPrice * rp.quantity, 0),
    totalProfit: roomProducts.reduce(
      (acc, rp) => acc + (rp.clientPrice - rp.costPrice) * rp.quantity,
      0
    ),
    byApprovalStatus: {
      pending: roomProducts.filter((rp) => rp.clientApprovalStatus === 'pending').length,
      approved: roomProducts.filter((rp) => rp.clientApprovalStatus === 'approved').length,
      rejected: roomProducts.filter((rp) => rp.clientApprovalStatus === 'rejected').length,
      revision_requested: roomProducts.filter(
        (rp) => rp.clientApprovalStatus === 'revision_requested'
      ).length,
    },
    byProcurementStatus: {
      not_ordered: roomProducts.filter((rp) => rp.procurementStatus === 'not_ordered').length,
      quoted: roomProducts.filter((rp) => rp.procurementStatus === 'quoted').length,
      ordered: roomProducts.filter((rp) => rp.procurementStatus === 'ordered').length,
      in_production: roomProducts.filter((rp) => rp.procurementStatus === 'in_production').length,
      shipped: roomProducts.filter((rp) => rp.procurementStatus === 'shipped').length,
      delivered: roomProducts.filter((rp) => rp.procurementStatus === 'delivered').length,
      installed: roomProducts.filter((rp) => rp.procurementStatus === 'installed').length,
      issue: roomProducts.filter((rp) => rp.procurementStatus === 'issue').length,
    },
  };

  return {
    project,
    rooms,
    summary,
    items: roomProducts.map((rp) => ({
      ...rp,
      totalCost: rp.costPrice * rp.quantity,
      totalClientPrice: rp.clientPrice * rp.quantity,
      profit: (rp.clientPrice - rp.costPrice) * rp.quantity,
    })),
  };
});

export const getStats = tenantProcedure
  .input(ffeScheduleSchema.pick({ projectId: true }))
  .query(async ({ ctx, input }) => {
    const { projectId } = input;

    const roomProducts = await ctx.prisma.roomProduct.findMany({
      where: { tenantId: ctx.tenantId, projectId },
    });

    const now = new Date();
    const delayed = roomProducts.filter(
      (rp) =>
        rp.estimatedDeliveryDate &&
        rp.estimatedDeliveryDate < now &&
        !rp.actualDeliveryDate &&
        rp.procurementStatus !== 'delivered' &&
        rp.procurementStatus !== 'installed'
    );

    return {
      total: roomProducts.length,
      totalCost: roomProducts.reduce((acc, rp) => acc + rp.costPrice * rp.quantity, 0),
      totalClientPrice: roomProducts.reduce((acc, rp) => acc + rp.clientPrice * rp.quantity, 0),
      pendingApproval: roomProducts.filter((rp) => rp.clientApprovalStatus === 'pending').length,
      approved: roomProducts.filter((rp) => rp.clientApprovalStatus === 'approved').length,
      notOrdered: roomProducts.filter((rp) => rp.procurementStatus === 'not_ordered').length,
      ordered: roomProducts.filter(
        (rp) => rp.procurementStatus === 'ordered' || rp.procurementStatus === 'in_production'
      ).length,
      delivered: roomProducts.filter((rp) => rp.procurementStatus === 'delivered').length,
      installed: roomProducts.filter((rp) => rp.procurementStatus === 'installed').length,
      withIssues: roomProducts.filter((rp) => rp.hasIssue).length,
      delayed: delayed.length,
    };
  });
