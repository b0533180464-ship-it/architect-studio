import { TRPCError } from '@trpc/server';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  listConfigSchema,
  getConfigByIdSchema,
  createConfigSchema,
  updateConfigSchema,
  deleteConfigSchema,
  reorderConfigSchema,
  resetConfigSchema,
} from './schemas';
import { getDefaultEntities } from './defaults';

export const configRouter = createTRPCRouter({
  // List entities by type
  list: tenantProcedure.input(listConfigSchema).query(async ({ ctx, input }) => {
    const { entityType, activeOnly } = input;

    return ctx.prisma.configurableEntity.findMany({
      where: {
        tenantId: ctx.tenantId,
        entityType,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: { order: 'asc' },
    });
  }),

  // Get entity by ID
  getById: tenantProcedure.input(getConfigByIdSchema).query(async ({ ctx, input }) => {
    const entity = await ctx.prisma.configurableEntity.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
    });

    if (!entity) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'הגדרה לא נמצאה' });
    }

    return entity;
  }),

  // Create entity
  create: tenantProcedure.input(createConfigSchema).mutation(async ({ ctx, input }) => {
    const { entityType, order, ...data } = input;

    // Get max order if not provided
    let finalOrder = order;
    if (finalOrder === undefined) {
      const maxOrder = await ctx.prisma.configurableEntity.aggregate({
        where: { tenantId: ctx.tenantId, entityType },
        _max: { order: true },
      });
      finalOrder = (maxOrder._max.order ?? -1) + 1;
    }

    // If setting as default, remove default from others
    if (data.isDefault) {
      await ctx.prisma.configurableEntity.updateMany({
        where: { tenantId: ctx.tenantId, entityType, isDefault: true },
        data: { isDefault: false },
      });
    }

    return ctx.prisma.configurableEntity.create({
      data: {
        ...data,
        entityType,
        tenantId: ctx.tenantId,
        order: finalOrder,
      },
    });
  }),

  // Update entity
  update: tenantProcedure.input(updateConfigSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;

    const existing = await ctx.prisma.configurableEntity.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });

    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'הגדרה לא נמצאה' });
    }

    // If setting as default, remove default from others
    if (data.isDefault) {
      await ctx.prisma.configurableEntity.updateMany({
        where: { tenantId: ctx.tenantId, entityType: existing.entityType, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return ctx.prisma.configurableEntity.update({
      where: { id },
      data,
    });
  }),

  // Delete entity (only non-system)
  delete: tenantProcedure.input(deleteConfigSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.configurableEntity.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
    });

    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'הגדרה לא נמצאה' });
    }

    if (existing.isSystem) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'לא ניתן למחוק הגדרת מערכת' });
    }

    return ctx.prisma.configurableEntity.delete({ where: { id: input.id } });
  }),

  // Reorder entities
  reorder: tenantProcedure.input(reorderConfigSchema).mutation(async ({ ctx, input }) => {
    const { entityType, ids } = input;

    const updates = ids.map((id, index) =>
      ctx.prisma.configurableEntity.updateMany({
        where: { id, tenantId: ctx.tenantId, entityType },
        data: { order: index },
      })
    );

    await ctx.prisma.$transaction(updates);

    return { success: true };
  }),

  // Reset to defaults
  reset: tenantProcedure.input(resetConfigSchema).mutation(async ({ ctx, input }) => {
    const { entityType } = input;

    // Delete all non-system entities
    await ctx.prisma.configurableEntity.deleteMany({
      where: { tenantId: ctx.tenantId, entityType, isSystem: false },
    });

    // Re-create default entities
    const defaults = getDefaultEntities(entityType);

    await ctx.prisma.configurableEntity.createMany({
      data: defaults.map((entity) => ({
        ...entity,
        tenantId: ctx.tenantId,
        entityType,
      })),
      skipDuplicates: true,
    });

    return { success: true };
  }),
});
