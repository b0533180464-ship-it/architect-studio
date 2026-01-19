import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { tenantProcedure } from '../../trpc';
import {
  createDeliveryTrackingSchema,
  updateDeliveryTrackingSchema,
  deleteDeliveryTrackingSchema,
  updateDeliveryStatusSchema,
  reportDeliveryIssueSchema,
  resolveDeliveryIssueSchema,
} from './schemas';

interface StatusHistoryEntry {
  status: string;
  date: Date;
  location?: string;
  note?: string;
}

export const createDeliveryTracking = tenantProcedure
  .input(createDeliveryTrackingSchema)
  .mutation(async ({ ctx, input }) => {
    const { supplierId, ...data } = input;

    const supplier = await ctx.prisma.supplier.findFirst({
      where: { id: supplierId, tenantId: ctx.tenantId },
    });
    if (!supplier) throw new TRPCError({ code: 'NOT_FOUND', message: 'ספק לא נמצא' });

    // Validate at least one reference is set
    if (!input.purchaseOrderId && !input.purchaseOrderItemId && !input.roomProductId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'חייב לציין לפחות קישור אחד (הזמנה, פריט או מוצר בחדר)',
      });
    }

    const statusHistory: StatusHistoryEntry[] = [{ status: 'ordered', date: new Date() }];

    return ctx.prisma.deliveryTracking.create({
      data: {
        tenantId: ctx.tenantId,
        supplierId,
        ...data,
        statusHistory: statusHistory as unknown as Prisma.InputJsonValue,
      },
      include: {
        supplier: { select: { id: true, name: true } },
        purchaseOrder: { select: { id: true, orderNumber: true } },
      },
    });
  });

export const updateDeliveryTracking = tenantProcedure
  .input(updateDeliveryTrackingSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;

    const existing = await ctx.prisma.deliveryTracking.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מעקב משלוח לא נמצא' });

    return ctx.prisma.deliveryTracking.update({
      where: { id },
      data,
      include: {
        supplier: { select: { id: true, name: true } },
        purchaseOrder: { select: { id: true, orderNumber: true } },
      },
    });
  });

export const deleteDeliveryTracking = tenantProcedure
  .input(deleteDeliveryTrackingSchema)
  .mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.deliveryTracking.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מעקב משלוח לא נמצא' });

    return ctx.prisma.deliveryTracking.delete({ where: { id: input.id } });
  });

export const updateStatus = tenantProcedure
  .input(updateDeliveryStatusSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, status, location, note } = input;

    const existing = await ctx.prisma.deliveryTracking.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מעקב משלוח לא נמצא' });

    const currentHistory = (existing.statusHistory || []) as unknown as StatusHistoryEntry[];
    const newHistory: StatusHistoryEntry[] = [
      ...currentHistory,
      { status, date: new Date(), location, note },
    ];

    const updateData: Prisma.DeliveryTrackingUpdateInput = {
      status,
      statusHistory: newHistory as unknown as Prisma.InputJsonValue,
    };

    if (status === 'shipped' && !existing.actualShipDate) {
      updateData.actualShipDate = new Date();
    }
    if (status === 'delivered' && !existing.actualDeliveryDate) {
      updateData.actualDeliveryDate = new Date();
    }

    return ctx.prisma.deliveryTracking.update({
      where: { id },
      data: updateData,
      include: {
        supplier: { select: { id: true, name: true } },
        purchaseOrder: { select: { id: true, orderNumber: true } },
      },
    });
  });

export const reportIssue = tenantProcedure
  .input(reportDeliveryIssueSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, issueType, issueDescription } = input;

    const existing = await ctx.prisma.deliveryTracking.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מעקב משלוח לא נמצא' });

    const currentHistory = (existing.statusHistory || []) as unknown as StatusHistoryEntry[];
    const newHistory: StatusHistoryEntry[] = [
      ...currentHistory,
      { status: 'issue', date: new Date(), note: issueDescription },
    ];

    return ctx.prisma.deliveryTracking.update({
      where: { id },
      data: {
        hasIssue: true,
        issueType,
        issueDescription,
        status: 'issue',
        statusHistory: newHistory as unknown as Prisma.InputJsonValue,
        issueResolvedAt: null,
      },
    });
  });

export const resolveIssue = tenantProcedure
  .input(resolveDeliveryIssueSchema)
  .mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.deliveryTracking.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מעקב משלוח לא נמצא' });

    // Determine what status to return to
    const previousStatus = existing.actualShipDate ? 'shipped' : 'confirmed';

    return ctx.prisma.deliveryTracking.update({
      where: { id: input.id },
      data: {
        hasIssue: false,
        issueResolvedAt: new Date(),
        status: previousStatus,
      },
    });
  });
