/* eslint-disable complexity */
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { tenantProcedure } from '../../trpc';
import { listProductsSchema, getProductByIdSchema } from './schemas';

export const listProducts = tenantProcedure
  .input(listProductsSchema)
  .query(async ({ ctx, input }) => {
    const {
      page,
      pageSize,
      categoryId,
      supplierId,
      tags,
      minPrice,
      maxPrice,
      hasImage,
      search,
      sortBy,
      sortOrder,
      includeInactive,
    } = input;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = { tenantId: ctx.tenantId };

    if (!includeInactive) where.isActive = true;
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (tags && tags.length > 0) where.tags = { array_contains: tags };
    if (minPrice !== undefined) {
      where.costPrice = { ...((where.costPrice as object) || {}), gte: minPrice };
    }
    if (maxPrice !== undefined) {
      where.costPrice = { ...((where.costPrice as object) || {}), lte: maxPrice };
    }
    if (hasImage !== undefined) where.imageUrl = hasImage ? { not: null } : null;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { supplierSku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [categories, suppliers] = await Promise.all([
      ctx.prisma.configurableEntity.findMany({
        where: { tenantId: ctx.tenantId, entityType: 'product_category' },
      }),
      ctx.prisma.supplier.findMany({
        where: { tenantId: ctx.tenantId, isActive: true },
        select: { id: true, name: true },
      }),
    ]);
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sortBy === 'usageCount' ? { createdAt: sortOrder } : { [sortBy]: sortOrder };

    const [products, total] = await Promise.all([
      ctx.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: { _count: { select: { roomProducts: true } } },
      }),
      ctx.prisma.product.count({ where }),
    ]);

    return {
      items: products.map((product) => ({
        ...product,
        category: product.categoryId ? categoryMap.get(product.categoryId) : null,
        supplier: product.supplierId ? supplierMap.get(product.supplierId) : null,
        usageCount: product._count.roomProducts,
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

export const getProductById = tenantProcedure
  .input(getProductByIdSchema)
  .query(async ({ ctx, input }) => {
    const { id } = input;

    const [product, categories, suppliers] = await Promise.all([
      ctx.prisma.product.findFirst({
        where: { id, tenantId: ctx.tenantId },
        include: { _count: { select: { roomProducts: true } } },
      }),
      ctx.prisma.configurableEntity.findMany({
        where: { tenantId: ctx.tenantId, entityType: 'product_category' },
      }),
      ctx.prisma.supplier.findMany({
        where: { tenantId: ctx.tenantId },
        select: { id: true, name: true },
      }),
    ]);

    if (!product) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'מוצר לא נמצא' });
    }

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    const lastUsage = await ctx.prisma.roomProduct.findFirst({
      where: { productId: id, tenantId: ctx.tenantId },
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { id: true, name: true } } },
    });

    return {
      ...product,
      category: product.categoryId ? categoryMap.get(product.categoryId) : null,
      supplier: product.supplierId ? supplierMap.get(product.supplierId) : null,
      usageCount: product._count.roomProducts,
      lastUsedAt: lastUsage?.createdAt ?? null,
      lastUsedInProject: lastUsage?.project ?? null,
    };
  });

export const searchProducts = tenantProcedure
  .input(z.object({ query: z.string().min(1), limit: z.number().int().min(1).max(50).default(10) }))
  .query(async ({ ctx, input }) => {
    const [products, suppliers] = await Promise.all([
      ctx.prisma.product.findMany({
        where: {
          tenantId: ctx.tenantId,
          isActive: true,
          OR: [
            { name: { contains: input.query, mode: 'insensitive' } },
            { sku: { contains: input.query, mode: 'insensitive' } },
            { description: { contains: input.query, mode: 'insensitive' } },
          ],
        },
        take: input.limit,
        select: {
          id: true,
          name: true,
          sku: true,
          imageUrl: true,
          costPrice: true,
          retailPrice: true,
          supplierId: true,
        },
      }),
      ctx.prisma.supplier.findMany({
        where: { tenantId: ctx.tenantId, isActive: true },
        select: { id: true, name: true },
      }),
    ]);

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    return products.map((product) => ({
      ...product,
      supplier: product.supplierId ? supplierMap.get(product.supplierId) : null,
    }));
  });

export const getCategories = tenantProcedure.query(async ({ ctx }) => {
  return ctx.prisma.configurableEntity.findMany({
    where: { tenantId: ctx.tenantId, entityType: 'product_category', isActive: true },
    orderBy: { order: 'asc' },
  });
});

export const getStats = tenantProcedure.query(async ({ ctx }) => {
  const [totalProducts, activeProducts, withoutImage, productsByCategory] = await Promise.all([
    ctx.prisma.product.count({ where: { tenantId: ctx.tenantId } }),
    ctx.prisma.product.count({ where: { tenantId: ctx.tenantId, isActive: true } }),
    ctx.prisma.product.count({
      where: { tenantId: ctx.tenantId, isActive: true, imageUrl: null },
    }),
    ctx.prisma.product.groupBy({
      by: ['categoryId'],
      where: { tenantId: ctx.tenantId, isActive: true },
      _count: { id: true },
    }),
  ]);

  const categories = await ctx.prisma.configurableEntity.findMany({
    where: { tenantId: ctx.tenantId, entityType: 'product_category' },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return {
    total: totalProducts,
    active: activeProducts,
    inactive: totalProducts - activeProducts,
    withoutImage,
    byCategory: productsByCategory.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryId ? categoryMap.get(item.categoryId) : 'ללא קטגוריה',
      count: item._count.id,
    })),
  };
});
