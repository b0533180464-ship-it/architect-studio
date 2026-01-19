/* eslint-disable complexity */
import { TRPCError } from '@trpc/server';
import { tenantProcedure } from '../../trpc';
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  deletePurchaseOrderSchema,
  updateStatusSchema,
  approvePurchaseOrderSchema,
  addItemSchema,
  updateItemSchema,
  deleteItemSchema,
  reorderItemsSchema,
} from './schemas';

// Generate PO number
async function generateOrderNumber(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any,
  tenantId: string
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PO-${year}-`;
  const lastOrder = await prisma.purchaseOrder.findFirst({
    where: { tenantId, orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  });
  const nextNum = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[2]) + 1 : 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

export const createPurchaseOrder = tenantProcedure
  .input(createPurchaseOrderSchema)
  .mutation(async ({ ctx, input }) => {
    const { projectId, supplierId, vatRate = 17, ...data } = input;

    const [project, supplier] = await Promise.all([
      ctx.prisma.project.findFirst({ where: { id: projectId, tenantId: ctx.tenantId } }),
      ctx.prisma.supplier.findFirst({ where: { id: supplierId, tenantId: ctx.tenantId } }),
    ]);

    if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });
    if (!supplier) throw new TRPCError({ code: 'NOT_FOUND', message: 'ספק לא נמצא' });

    const orderNumber = await generateOrderNumber(ctx.prisma, ctx.tenantId);
    const vatAmount = ((data.shippingCost || 0) - (data.discount || 0)) * (vatRate / 100);

    return ctx.prisma.purchaseOrder.create({
      data: {
        tenantId: ctx.tenantId,
        projectId,
        supplierId,
        orderNumber,
        ...data,
        vatAmount,
        total: (data.shippingCost || 0) - (data.discount || 0) + vatAmount,
        createdById: ctx.auth.user.id,
      },
      include: {
        project: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });
  });

export const updatePurchaseOrder = tenantProcedure
  .input(updatePurchaseOrderSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;

    const existing = await ctx.prisma.purchaseOrder.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'הזמנה לא נמצאה' });

    return ctx.prisma.purchaseOrder.update({
      where: { id },
      data,
      include: {
        project: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });
  });

export const deletePurchaseOrder = tenantProcedure
  .input(deletePurchaseOrderSchema)
  .mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.purchaseOrder.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'הזמנה לא נמצאה' });
    if (existing.status !== 'draft') {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן למחוק רק הזמנות בסטטוס טיוטה' });
    }

    return ctx.prisma.purchaseOrder.delete({ where: { id: input.id } });
  });

export const updateStatus = tenantProcedure
  .input(updateStatusSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, status } = input;

    const existing = await ctx.prisma.purchaseOrder.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'הזמנה לא נמצאה' });

    const updateData: Record<string, unknown> = { status };
    if (status === 'delivered' && !existing.actualDelivery) {
      updateData.actualDelivery = new Date();
    }

    return ctx.prisma.purchaseOrder.update({ where: { id }, data: updateData });
  });

export const approvePurchaseOrder = tenantProcedure
  .input(approvePurchaseOrderSchema)
  .mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.purchaseOrder.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'הזמנה לא נמצאה' });

    return ctx.prisma.purchaseOrder.update({
      where: { id: input.id },
      data: {
        status: 'sent',
        approvedById: ctx.auth.user.id,
        approvedAt: new Date(),
      },
    });
  });

export const addItem = tenantProcedure
  .input(addItemSchema)
  .mutation(async ({ ctx, input }) => {
    const { purchaseOrderId, ...data } = input;

    const po = await ctx.prisma.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, tenantId: ctx.tenantId },
    });
    if (!po) throw new TRPCError({ code: 'NOT_FOUND', message: 'הזמנה לא נמצאה' });

    const maxOrder = await ctx.prisma.purchaseOrderItem.aggregate({
      where: { purchaseOrderId },
      _max: { order: true },
    });

    const totalPrice = data.quantity * data.unitPrice;

    const item = await ctx.prisma.purchaseOrderItem.create({
      data: {
        purchaseOrderId,
        ...data,
        totalPrice,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });

    await recalculateTotals(ctx.prisma, purchaseOrderId, po);

    return item;
  });

export const updateItem = tenantProcedure
  .input(updateItemSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, purchaseOrderId, ...data } = input;

    const po = await ctx.prisma.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, tenantId: ctx.tenantId },
    });
    if (!po) throw new TRPCError({ code: 'NOT_FOUND', message: 'הזמנה לא נמצאה' });

    const existingItem = await ctx.prisma.purchaseOrderItem.findFirst({
      where: { id, purchaseOrderId },
    });
    if (!existingItem) throw new TRPCError({ code: 'NOT_FOUND', message: 'פריט לא נמצא' });

    const quantity = data.quantity ?? existingItem.quantity;
    const unitPrice = data.unitPrice ?? existingItem.unitPrice;

    const item = await ctx.prisma.purchaseOrderItem.update({
      where: { id },
      data: { ...data, totalPrice: quantity * unitPrice },
    });

    await recalculateTotals(ctx.prisma, purchaseOrderId, po);

    return item;
  });

export const deleteItem = tenantProcedure
  .input(deleteItemSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, purchaseOrderId } = input;

    const po = await ctx.prisma.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, tenantId: ctx.tenantId },
    });
    if (!po) throw new TRPCError({ code: 'NOT_FOUND', message: 'הזמנה לא נמצאה' });

    await ctx.prisma.purchaseOrderItem.delete({ where: { id } });
    await recalculateTotals(ctx.prisma, purchaseOrderId, po);

    return { success: true };
  });

export const reorderItems = tenantProcedure
  .input(reorderItemsSchema)
  .mutation(async ({ ctx, input }) => {
    const { purchaseOrderId, itemIds } = input;

    const po = await ctx.prisma.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, tenantId: ctx.tenantId },
    });
    if (!po) throw new TRPCError({ code: 'NOT_FOUND', message: 'הזמנה לא נמצאה' });

    await ctx.prisma.$transaction(
      itemIds.map((id, index) =>
        ctx.prisma.purchaseOrderItem.updateMany({
          where: { id, purchaseOrderId },
          data: { order: index },
        })
      )
    );

    return { success: true };
  });

// Helper to recalculate totals
async function recalculateTotals(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any,
  purchaseOrderId: string,
  po: { discount: number; shippingCost: number }
) {
  const subtotalResult = await prisma.purchaseOrderItem.aggregate({
    where: { purchaseOrderId },
    _sum: { totalPrice: true },
  });

  const subtotal = subtotalResult._sum.totalPrice || 0;
  const afterDiscount = subtotal - (po.discount || 0) + (po.shippingCost || 0);
  const vatAmount = afterDiscount * 0.17;
  const total = afterDiscount + vatAmount;

  await prisma.purchaseOrder.update({
    where: { id: purchaseOrderId },
    data: { subtotal, vatAmount, total },
  });
}
