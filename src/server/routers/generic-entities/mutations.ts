import { TRPCError } from '@trpc/server';
import type { Prisma } from '@prisma/client';
import type { Context } from '../../trpc';
import type {
  CreateEntityInput,
  UpdateEntityInput,
  DeleteEntityInput,
  BulkUpdateInput,
} from './schemas';

// Extended context with tenant info
type TenantContext = Context & {
  tenantId: string;
  userRole: string;
  auth: { user: { id: string } };
};

// ============================================
// Create new entity
// ============================================
export async function createEntity(
  ctx: TenantContext,
  input: CreateEntityInput
) {
  // Verify entity type exists and belongs to tenant
  const entityType = await ctx.prisma.entityType.findFirst({
    where: { id: input.entityTypeId, tenantId: ctx.tenantId, isActive: true },
  });

  if (!entityType) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Entity type not found',
    });
  }

  return ctx.prisma.genericEntity.create({
    data: {
      tenantId: ctx.tenantId,
      entityTypeId: input.entityTypeId,
      name: input.name,
      data: (input.data ?? {}) as Prisma.InputJsonValue,
      createdById: ctx.auth.user.id,
    },
    include: {
      entityType: {
        select: { name: true, slug: true, icon: true, color: true },
      },
    },
  });
}

// ============================================
// Update entity
// ============================================
export async function updateEntity(
  ctx: TenantContext,
  input: UpdateEntityInput
) {
  const existing = await ctx.prisma.genericEntity.findFirst({
    where: { id: input.id, tenantId: ctx.tenantId },
  });

  if (!existing) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Entity not found',
    });
  }

  const { id, data, ...rest } = input;

  // Merge data if provided
  const updateData: Prisma.GenericEntityUpdateInput = { ...rest };
  if (data) {
    const existingData = existing.data as Record<string, unknown>;
    updateData.data = { ...existingData, ...data } as Prisma.InputJsonValue;
  }

  return ctx.prisma.genericEntity.update({
    where: { id },
    data: updateData,
    include: {
      entityType: {
        select: { name: true, slug: true, icon: true, color: true },
      },
    },
  });
}

// ============================================
// Delete entity
// ============================================
export async function deleteEntity(
  ctx: TenantContext,
  input: DeleteEntityInput
) {
  const existing = await ctx.prisma.genericEntity.findFirst({
    where: { id: input.id, tenantId: ctx.tenantId },
  });

  if (!existing) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Entity not found',
    });
  }

  return ctx.prisma.genericEntity.delete({
    where: { id: input.id },
  });
}

// ============================================
// Bulk update entities
// ============================================
export async function bulkUpdate(
  ctx: TenantContext,
  input: BulkUpdateInput
) {
  const results = await Promise.all(
    input.updates.map(async (update) => {
      const existing = await ctx.prisma.genericEntity.findFirst({
        where: { id: update.id, tenantId: ctx.tenantId },
      });

      if (!existing) return null;

      const updateData: Prisma.GenericEntityUpdateInput = {};
      if (update.name) updateData.name = update.name;
      if (update.data) {
        const existingData = existing.data as Record<string, unknown>;
        updateData.data = { ...existingData, ...update.data } as Prisma.InputJsonValue;
      }

      return ctx.prisma.genericEntity.update({
        where: { id: update.id },
        data: updateData,
      });
    })
  );

  return results.filter(Boolean);
}
