/* eslint-disable complexity */
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { tenantProcedure } from '../../trpc';
import {
  createRoomProductSchema,
  updateRoomProductSchema,
  deleteRoomProductSchema,
  updateApprovalStatusSchema,
  bulkUpdateApprovalSchema,
  updateProcurementStatusSchema,
  updateDeliverySchema,
  markInstalledSchema,
  reportIssueSchema,
  resolveIssueSchema,
  reorderProductsSchema,
} from './schemas';

export const createRoomProduct = tenantProcedure
  .input(createRoomProductSchema)
  .mutation(async ({ ctx, input }) => {
    const { projectId, roomId, productId, ...data } = input;

    const [project, room, product] = await Promise.all([
      ctx.prisma.project.findFirst({ where: { id: projectId, tenantId: ctx.tenantId } }),
      ctx.prisma.room.findFirst({ where: { id: roomId, projectId, tenantId: ctx.tenantId } }),
      ctx.prisma.product.findFirst({ where: { id: productId, tenantId: ctx.tenantId } }),
    ]);

    if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'חדר לא נמצא' });
    if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא' });

    const maxOrder = await ctx.prisma.roomProduct.aggregate({
      where: { roomId, tenantId: ctx.tenantId },
      _max: { order: true },
    });

    return ctx.prisma.roomProduct.create({
      data: {
        tenantId: ctx.tenantId,
        projectId,
        roomId,
        productId,
        ...data,
        order: (maxOrder._max.order ?? 0) + 1,
      },
      include: { product: true, room: { select: { id: true, name: true } } },
    });
  });

export const updateRoomProduct = tenantProcedure
  .input(updateRoomProductSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;

    const existing = await ctx.prisma.roomProduct.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא בחדר' });

    return ctx.prisma.roomProduct.update({
      where: { id },
      data,
      include: { product: true, room: { select: { id: true, name: true } } },
    });
  });

export const deleteRoomProduct = tenantProcedure
  .input(deleteRoomProductSchema)
  .mutation(async ({ ctx, input }) => {
    const { id } = input;

    const existing = await ctx.prisma.roomProduct.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא בחדר' });

    return ctx.prisma.roomProduct.delete({ where: { id } });
  });

export const updateApproval = tenantProcedure
  .input(updateApprovalStatusSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, status, feedback } = input;

    const existing = await ctx.prisma.roomProduct.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא בחדר' });

    return ctx.prisma.roomProduct.update({
      where: { id },
      data: {
        clientApprovalStatus: status,
        clientApprovedAt: status === 'approved' ? new Date() : null,
        clientFeedback: feedback,
      },
    });
  });

export const bulkUpdateApproval = tenantProcedure
  .input(bulkUpdateApprovalSchema)
  .mutation(async ({ ctx, input }) => {
    const { ids, status } = input;

    const count = await ctx.prisma.roomProduct.count({
      where: { id: { in: ids }, tenantId: ctx.tenantId },
    });
    if (count !== ids.length) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'חלק מהמוצרים לא נמצאו' });
    }

    return ctx.prisma.roomProduct.updateMany({
      where: { id: { in: ids }, tenantId: ctx.tenantId },
      data: {
        clientApprovalStatus: status,
        clientApprovedAt: status === 'approved' ? new Date() : null,
      },
    });
  });

export const updateProcurement = tenantProcedure
  .input(updateProcurementStatusSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, status, vendorOrderNumber, estimatedDeliveryDate, trackingNumber, carrier } = input;

    const existing = await ctx.prisma.roomProduct.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא בחדר' });

    const updateData: Prisma.RoomProductUpdateInput = { procurementStatus: status };

    if (status === 'ordered' && !existing.orderDate) updateData.orderDate = new Date();
    if (status === 'delivered' && !existing.actualDeliveryDate)
      updateData.actualDeliveryDate = new Date();
    if (status === 'installed' && !existing.installedAt) updateData.installedAt = new Date();
    if (vendorOrderNumber) updateData.vendorOrderNumber = vendorOrderNumber;
    if (estimatedDeliveryDate) updateData.estimatedDeliveryDate = estimatedDeliveryDate;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (carrier) updateData.carrier = carrier;

    return ctx.prisma.roomProduct.update({ where: { id }, data: updateData });
  });

export const updateDelivery = tenantProcedure
  .input(updateDeliverySchema)
  .mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;

    const existing = await ctx.prisma.roomProduct.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא בחדר' });

    return ctx.prisma.roomProduct.update({ where: { id }, data });
  });

export const markInstalled = tenantProcedure
  .input(markInstalledSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, installedBy } = input;

    const existing = await ctx.prisma.roomProduct.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא בחדר' });

    return ctx.prisma.roomProduct.update({
      where: { id },
      data: { procurementStatus: 'installed', installedAt: new Date(), installedBy },
    });
  });

export const reportIssue = tenantProcedure
  .input(reportIssueSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, issueType, issueDescription } = input;

    const existing = await ctx.prisma.roomProduct.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא בחדר' });

    return ctx.prisma.roomProduct.update({
      where: { id },
      data: {
        hasIssue: true,
        issueType,
        issueDescription,
        procurementStatus: 'issue',
        issueResolvedAt: null,
      },
    });
  });

export const resolveIssue = tenantProcedure
  .input(resolveIssueSchema)
  .mutation(async ({ ctx, input }) => {
    const { id } = input;

    const existing = await ctx.prisma.roomProduct.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא בחדר' });

    return ctx.prisma.roomProduct.update({
      where: { id },
      data: {
        hasIssue: false,
        issueResolvedAt: new Date(),
        procurementStatus:
          existing.procurementStatus === 'issue' ? 'delivered' : existing.procurementStatus,
      },
    });
  });

export const reorder = tenantProcedure
  .input(reorderProductsSchema)
  .mutation(async ({ ctx, input }) => {
    const { roomId, productIds } = input;

    const room = await ctx.prisma.room.findFirst({
      where: { id: roomId, tenantId: ctx.tenantId },
    });
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'חדר לא נמצא' });

    await ctx.prisma.$transaction(
      productIds.map((id, index) =>
        ctx.prisma.roomProduct.updateMany({
          where: { id, roomId, tenantId: ctx.tenantId },
          data: { order: index },
        })
      )
    );

    return { success: true };
  });
