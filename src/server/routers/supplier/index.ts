import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  createSupplierSchema,
  updateSupplierSchema,
  listSuppliersSchema,
  getSupplierByIdSchema,
  deleteSupplierSchema,
} from './schemas';

export const supplierRouter = createTRPCRouter({
  // List suppliers with pagination and filters
  list: tenantProcedure.input(listSuppliersSchema).query(async ({ ctx, input }) => {
    const { page, pageSize, categoryId, city, hasTradeAccount, search, sortBy, sortOrder, includeInactive } = input;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.SupplierWhereInput = {
      tenantId: ctx.tenantId,
    };

    if (!includeInactive) {
      where.isActive = true;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (city) {
      where.city = city;
    }
    if (hasTradeAccount !== undefined) {
      where.hasTradeAccount = hasTradeAccount;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { website: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch categories for mapping
    const categories = await ctx.prisma.configurableEntity.findMany({
      where: { tenantId: ctx.tenantId, entityType: 'supplier_category' },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    // Execute query
    const [suppliers, total] = await Promise.all([
      ctx.prisma.supplier.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      ctx.prisma.supplier.count({ where }),
    ]);

    return {
      items: suppliers.map((supplier) => ({
        ...supplier,
        category: supplier.categoryId ? categoryMap.get(supplier.categoryId) : null,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasMore: page * pageSize < total,
      },
    };
  }),

  // Get supplier by ID
  getById: tenantProcedure.input(getSupplierByIdSchema).query(async ({ ctx, input }) => {
    const { id } = input;

    const [supplier, categories] = await Promise.all([
      ctx.prisma.supplier.findFirst({
        where: { id, tenantId: ctx.tenantId },
      }),
      ctx.prisma.configurableEntity.findMany({
        where: { tenantId: ctx.tenantId, entityType: 'supplier_category' },
      }),
    ]);

    if (!supplier) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'ספק לא נמצא' });
    }

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return {
      ...supplier,
      category: supplier.categoryId ? categoryMap.get(supplier.categoryId) : null,
    };
  }),

  // Create new supplier
  create: tenantProcedure.input(createSupplierSchema).mutation(async ({ ctx, input }) => {
    // Clean empty strings
    const data = {
      ...input,
      email: input.email === '' ? null : input.email,
      website: input.website === '' ? null : input.website,
    };

    // Validate categoryId if provided
    if (input.categoryId) {
      const category = await ctx.prisma.configurableEntity.findFirst({
        where: { id: input.categoryId, tenantId: ctx.tenantId, entityType: 'supplier_category' },
      });
      if (!category) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'קטגוריה לא נמצאה' });
      }
    }

    return ctx.prisma.supplier.create({
      data: {
        ...data,
        tenantId: ctx.tenantId,
      },
    });
  }),

  // Update supplier
  update: tenantProcedure.input(updateSupplierSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;

    // Verify supplier exists and belongs to tenant
    const existing = await ctx.prisma.supplier.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });

    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'ספק לא נמצא' });
    }

    // Clean empty strings
    const updateData = {
      ...data,
      email: data.email === '' ? null : data.email,
      website: data.website === '' ? null : data.website,
    };

    // Validate categoryId if provided
    if (data.categoryId) {
      const category = await ctx.prisma.configurableEntity.findFirst({
        where: { id: data.categoryId, tenantId: ctx.tenantId, entityType: 'supplier_category' },
      });
      if (!category) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'קטגוריה לא נמצאה' });
      }
    }

    return ctx.prisma.supplier.update({
      where: { id },
      data: updateData,
    });
  }),

  // Soft delete supplier
  delete: tenantProcedure.input(deleteSupplierSchema).mutation(async ({ ctx, input }) => {
    const { id } = input;

    // Verify supplier exists and belongs to tenant
    const existing = await ctx.prisma.supplier.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });

    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'ספק לא נמצא' });
    }

    // Soft delete
    return ctx.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }),

  // Get distinct cities for filter dropdown
  getCities: tenantProcedure.query(async ({ ctx }) => {
    const suppliers = await ctx.prisma.supplier.findMany({
      where: { tenantId: ctx.tenantId, city: { not: null } },
      select: { city: true },
      distinct: ['city'],
    });
    return suppliers.map((s) => s.city).filter(Boolean) as string[];
  }),

  // Quick search (for autocomplete)
  search: tenantProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [suppliers, categories] = await Promise.all([
        ctx.prisma.supplier.findMany({
          where: {
            tenantId: ctx.tenantId,
            isActive: true,
            OR: [
              { name: { contains: input.query, mode: 'insensitive' } },
              { email: { contains: input.query, mode: 'insensitive' } },
              { phone: { contains: input.query } },
              { contactPerson: { contains: input.query, mode: 'insensitive' } },
            ],
          },
          take: 10,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            categoryId: true,
            rating: true,
            hasTradeAccount: true,
          },
        }),
        ctx.prisma.configurableEntity.findMany({
          where: { tenantId: ctx.tenantId, entityType: 'supplier_category' },
        }),
      ]);

      const categoryMap = new Map(categories.map((c) => [c.id, c]));

      return suppliers.map((supplier) => ({
        ...supplier,
        category: supplier.categoryId ? categoryMap.get(supplier.categoryId) : null,
      }));
    }),
});
