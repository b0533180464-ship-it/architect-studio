/* eslint-disable complexity */
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { tenantProcedure } from '../../trpc';
import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  duplicateProductSchema,
  addProductToRoomSchema,
} from './schemas';

export const createProduct = tenantProcedure
  .input(createProductSchema)
  .mutation(async ({ ctx, input }) => {
    const data = {
      ...input,
      imageUrl: input.imageUrl === '' ? null : input.imageUrl,
      productUrl: input.productUrl === '' ? null : input.productUrl,
      specSheetUrl: input.specSheetUrl === '' ? null : input.specSheetUrl,
    };

    if (input.categoryId) {
      const category = await ctx.prisma.configurableEntity.findFirst({
        where: { id: input.categoryId, tenantId: ctx.tenantId, entityType: 'product_category' },
      });
      if (!category) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'קטגוריה לא נמצאה' });
      }
    }

    if (input.supplierId) {
      const supplier = await ctx.prisma.supplier.findFirst({
        where: { id: input.supplierId, tenantId: ctx.tenantId },
      });
      if (!supplier) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'ספק לא נמצא' });
      }
    }

    if (input.sku) {
      const existing = await ctx.prisma.product.findFirst({
        where: { tenantId: ctx.tenantId, sku: input.sku },
      });
      if (existing) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'מק״ט כבר קיים במערכת' });
      }
    }

    return ctx.prisma.product.create({
      data: { ...data, tenantId: ctx.tenantId },
    });
  });

export const updateProduct = tenantProcedure
  .input(updateProductSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;

    const existing = await ctx.prisma.product.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא' });
    }

    const updateData = {
      ...data,
      imageUrl: data.imageUrl === '' ? null : data.imageUrl,
      productUrl: data.productUrl === '' ? null : data.productUrl,
      specSheetUrl: data.specSheetUrl === '' ? null : data.specSheetUrl,
    };

    if (data.categoryId) {
      const category = await ctx.prisma.configurableEntity.findFirst({
        where: { id: data.categoryId, tenantId: ctx.tenantId, entityType: 'product_category' },
      });
      if (!category) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'קטגוריה לא נמצאה' });
      }
    }

    if (data.supplierId) {
      const supplier = await ctx.prisma.supplier.findFirst({
        where: { id: data.supplierId, tenantId: ctx.tenantId },
      });
      if (!supplier) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'ספק לא נמצא' });
      }
    }

    if (data.sku && data.sku !== existing.sku) {
      const skuExists = await ctx.prisma.product.findFirst({
        where: { tenantId: ctx.tenantId, sku: data.sku, id: { not: id } },
      });
      if (skuExists) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'מק״ט כבר קיים במערכת' });
      }
    }

    return ctx.prisma.product.update({
      where: { id },
      data: updateData,
    });
  });

export const deleteProduct = tenantProcedure
  .input(deleteProductSchema)
  .mutation(async ({ ctx, input }) => {
    const { id } = input;

    const existing = await ctx.prisma.product.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא' });
    }

    return ctx.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  });

export const duplicateProduct = tenantProcedure
  .input(duplicateProductSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, name } = input;

    const existing = await ctx.prisma.product.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא' });
    }

    let newSku: string | null = null;
    if (existing.sku) {
      let counter = 1;
      while (true) {
        const potentialSku = `${existing.sku}-${counter}`;
        const skuExists = await ctx.prisma.product.findFirst({
          where: { tenantId: ctx.tenantId, sku: potentialSku },
        });
        if (!skuExists) {
          newSku = potentialSku;
          break;
        }
        counter++;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, createdAt: _c, updatedAt: _u, images, tags, ...productData } = existing;
    return ctx.prisma.product.create({
      data: {
        ...productData,
        name: name || `${existing.name} (עותק)`,
        sku: newSku,
        images: images as Prisma.InputJsonValue,
        tags: tags as Prisma.InputJsonValue,
      },
    });
  });

export const addProductToRoom = tenantProcedure
  .input(addProductToRoomSchema)
  .mutation(async ({ ctx, input }) => {
    const { productId, projectId, roomId, quantity, costPrice, clientPrice, markupPercent, notes } =
      input;

    const [product, project, room] = await Promise.all([
      ctx.prisma.product.findFirst({ where: { id: productId, tenantId: ctx.tenantId } }),
      ctx.prisma.project.findFirst({ where: { id: projectId, tenantId: ctx.tenantId } }),
      ctx.prisma.room.findFirst({ where: { id: roomId, projectId, tenantId: ctx.tenantId } }),
    ]);

    if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא' });
    if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'חדר לא נמצא' });

    const tenant = await ctx.prisma.tenant.findUnique({ where: { id: ctx.tenantId } });
    const defaultMarkup = (project.markupPercent ?? tenant?.vatRate ?? 30) as number;

    const finalCostPrice = costPrice ?? product.costPrice ?? 0;
    const finalMarkup = markupPercent ?? defaultMarkup;
    const finalClientPrice = clientPrice ?? finalCostPrice * (1 + finalMarkup / 100);

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
        quantity,
        costPrice: finalCostPrice,
        retailPrice: product.retailPrice,
        clientPrice: finalClientPrice,
        markupPercent: finalMarkup,
        notes,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });
  });
