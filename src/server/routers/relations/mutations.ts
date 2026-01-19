import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import type { z } from 'zod';
import type { Context } from '../../trpc';
import type { AuthContext } from '@/lib/auth';
import type {
  createRelationDefSchema,
  updateRelationDefSchema,
  deleteRelationDefSchema,
  addEntityRelationSchema,
  removeEntityRelationSchema,
  reorderEntityRelationsSchema,
} from './schemas';

type TenantContext = Context & { tenantId: string; userRole: string; auth: AuthContext };

// Create relation definition
export async function createRelationDef(
  ctx: TenantContext,
  input: z.infer<typeof createRelationDefSchema>
) {
  const { tenantId } = ctx;

  // Check for duplicate fieldKey in same source entity type
  const existing = await ctx.prisma.relationDefinition.findFirst({
    where: { tenantId, sourceEntityType: input.sourceEntityType, fieldKey: input.fieldKey },
  });

  if (existing) {
    throw new TRPCError({ code: 'CONFLICT', message: 'מפתח קשר כבר קיים לישות זו' });
  }

  return ctx.prisma.relationDefinition.create({
    data: {
      tenantId,
      name: input.name,
      fieldKey: input.fieldKey,
      sourceEntityType: input.sourceEntityType,
      targetEntityTypes: input.targetEntityTypes,
      relationType: input.relationType,
      isBidirectional: input.isBidirectional,
      inverseName: input.inverseName,
      displayFields: input.displayFields ?? Prisma.JsonNull,
    },
  });
}

// Update relation definition
export async function updateRelationDef(
  ctx: TenantContext,
  input: z.infer<typeof updateRelationDefSchema>
) {
  const { tenantId } = ctx;
  const { id, ...data } = input;

  const existing = await ctx.prisma.relationDefinition.findFirst({
    where: { tenantId, id },
  });

  if (!existing) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'הגדרת קשר לא נמצאה' });
  }

  const updateData: Prisma.RelationDefinitionUpdateInput = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.targetEntityTypes !== undefined) updateData.targetEntityTypes = data.targetEntityTypes;
  if (data.isBidirectional !== undefined) updateData.isBidirectional = data.isBidirectional;
  if (data.inverseName !== undefined) updateData.inverseName = data.inverseName;
  if (data.displayFields !== undefined) {
    updateData.displayFields = data.displayFields === null ? Prisma.JsonNull : data.displayFields;
  }
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return ctx.prisma.relationDefinition.update({
    where: { id },
    data: updateData,
  });
}

// Delete relation definition (and all related entity relations)
export async function deleteRelationDef(
  ctx: TenantContext,
  input: z.infer<typeof deleteRelationDefSchema>
) {
  const { tenantId } = ctx;
  const { id } = input;

  const existing = await ctx.prisma.relationDefinition.findFirst({
    where: { tenantId, id },
  });

  if (!existing) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'הגדרת קשר לא נמצאה' });
  }

  // Delete all entity relations first, then the definition
  await ctx.prisma.entityRelation.deleteMany({ where: { relationDefId: id } });
  await ctx.prisma.relationDefinition.delete({ where: { id } });

  return { success: true };
}

// Add entity relation
export async function addEntityRelation(
  ctx: TenantContext,
  input: z.infer<typeof addEntityRelationSchema>
) {
  const { tenantId } = ctx;

  // Verify relation definition exists
  const relationDef = await ctx.prisma.relationDefinition.findFirst({
    where: { tenantId, id: input.relationDefId },
  });

  if (!relationDef) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'הגדרת קשר לא נמצאה' });
  }

  // Validate target entity type is allowed
  if (!relationDef.targetEntityTypes.includes(input.targetEntityType)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'סוג ישות יעד לא מורשה לקשר זה' });
  }

  // Check for duplicates
  const existing = await ctx.prisma.entityRelation.findFirst({
    where: {
      relationDefId: input.relationDefId,
      sourceEntityId: input.sourceEntityId,
      targetEntityId: input.targetEntityId,
    },
  });

  if (existing) {
    return existing; // Already exists, return it
  }

  return ctx.prisma.entityRelation.create({
    data: {
      tenantId,
      relationDefId: input.relationDefId,
      sourceEntityType: input.sourceEntityType,
      sourceEntityId: input.sourceEntityId,
      targetEntityType: input.targetEntityType,
      targetEntityId: input.targetEntityId,
      order: input.order,
    },
  });
}

// Remove entity relation
export async function removeEntityRelation(
  ctx: TenantContext,
  input: z.infer<typeof removeEntityRelationSchema>
) {
  const { tenantId } = ctx;
  const { id } = input;

  const existing = await ctx.prisma.entityRelation.findFirst({
    where: { tenantId, id },
  });

  if (!existing) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'קשר לא נמצא' });
  }

  await ctx.prisma.entityRelation.delete({ where: { id } });
  return { success: true };
}

// Reorder entity relations
export async function reorderEntityRelations(
  ctx: TenantContext,
  input: z.infer<typeof reorderEntityRelationsSchema>
) {
  const { tenantId } = ctx;
  const { relationDefId, sourceEntityId, orderedTargetIds } = input;

  // Update each relation's order
  await Promise.all(
    orderedTargetIds.map((targetId, index) =>
      ctx.prisma.entityRelation.updateMany({
        where: { tenantId, relationDefId, sourceEntityId, targetEntityId: targetId },
        data: { order: index },
      })
    )
  );

  return { success: true };
}
