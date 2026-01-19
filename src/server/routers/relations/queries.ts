import { TRPCError } from '@trpc/server';
import type { z } from 'zod';
import type { Context } from '../../trpc';
import type { AuthContext } from '@/lib/auth';
import type {
  listRelationDefsSchema,
  getRelationDefByIdSchema,
  listEntityRelationsSchema,
} from './schemas';

type TenantContext = Context & { tenantId: string; userRole: string; auth: AuthContext };

// List relation definitions (includes virtual inverse definitions for bidirectional relations)
export async function listRelationDefs(
  ctx: TenantContext,
  input: z.infer<typeof listRelationDefsSchema>
) {
  const { tenantId } = ctx;
  const { sourceEntityType, targetEntityType, activeOnly } = input;

  // 1. Get direct definitions
  const directWhere: Record<string, unknown> = { tenantId };
  if (sourceEntityType) directWhere.sourceEntityType = sourceEntityType;
  if (targetEntityType) directWhere.targetEntityTypes = { has: targetEntityType };
  if (activeOnly) directWhere.isActive = true;

  const directDefs = await ctx.prisma.relationDefinition.findMany({
    where: directWhere,
    orderBy: { name: 'asc' },
  });

  // 2. For bidirectional: get inverse definitions
  // Only when filtering by sourceEntityType
  if (!sourceEntityType) {
    return directDefs;
  }

  // Find bidirectional definitions where we are a target
  const inverseWhere: Record<string, unknown> = {
    tenantId,
    isBidirectional: true,
    targetEntityTypes: { has: sourceEntityType },
    sourceEntityType: { not: sourceEntityType }, // Exclude self-referential
  };
  if (activeOnly) inverseWhere.isActive = true;

  const inverseDefs = await ctx.prisma.relationDefinition.findMany({
    where: inverseWhere,
    orderBy: { name: 'asc' },
  });

  // 3. Transform inverse definitions to look like they're from our perspective
  const transformedInverse = inverseDefs.map((def) => ({
    ...def,
    // Mark as inverse for UI to know
    _isInverse: true as const,
    // Swap source and target for display
    _originalSourceEntityType: def.sourceEntityType,
    _displayName: def.inverseName || def.name, // Use inverseName if set
    _displayFieldKey: `_inverse_${def.fieldKey}`,
    _displayTargetEntityTypes: [def.sourceEntityType],
  }));

  // 4. Combine (direct first, then inverse)
  return [...directDefs, ...transformedInverse];
}

// Get relation definition by ID
export async function getRelationDefById(
  ctx: TenantContext,
  input: z.infer<typeof getRelationDefByIdSchema>
) {
  const { tenantId } = ctx;
  const { id } = input;

  const relationDef = await ctx.prisma.relationDefinition.findFirst({
    where: { tenantId, id },
  });

  if (!relationDef) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'הגדרת קשר לא נמצאה' });
  }

  return relationDef;
}

// List entity relations for a source entity (includes automatic inverse relations)
export async function listEntityRelations(
  ctx: TenantContext,
  input: z.infer<typeof listEntityRelationsSchema>
) {
  const { tenantId } = ctx;
  const { relationDefId, sourceEntityType, sourceEntityId } = input;

  // 1. Get direct relations (where entity is source)
  const directWhere: Record<string, unknown> = {
    tenantId,
    sourceEntityType,
    sourceEntityId,
  };
  if (relationDefId) directWhere.relationDefId = relationDefId;

  const directRelations = await ctx.prisma.entityRelation.findMany({
    where: directWhere,
    orderBy: { order: 'asc' },
    include: { relationDef: true },
  });

  // 2. For automatic bidirectional: find inverse relations
  // Only if we have a specific relationDefId
  if (!relationDefId) {
    return directRelations;
  }

  // Get the current relation definition
  const currentDef = await ctx.prisma.relationDefinition.findFirst({
    where: { tenantId, id: relationDefId },
  });

  if (!currentDef) {
    return directRelations;
  }

  // Mode 1: Find "matching" relation definitions (automatic bidirectional)
  // - Their sourceEntityType is in our targetEntityTypes
  // - Our sourceEntityType is in their targetEntityTypes
  const matchingDefs = await ctx.prisma.relationDefinition.findMany({
    where: {
      tenantId,
      isActive: true,
      id: { not: currentDef.id },
      sourceEntityType: { in: currentDef.targetEntityTypes },
      targetEntityTypes: { has: currentDef.sourceEntityType },
    },
  });

  // Mode 2: Find bidirectional definitions where we are a target
  // (this handles the case where currentDef is the "inverse" side)
  const bidirectionalDefs = currentDef.isBidirectional ? [] : await ctx.prisma.relationDefinition.findMany({
    where: {
      tenantId,
      isActive: true,
      id: { not: currentDef.id },
      isBidirectional: true,
      targetEntityTypes: { has: sourceEntityType },
      sourceEntityType: { in: currentDef.targetEntityTypes },
    },
  });

  const allInverseDefs = [...matchingDefs, ...bidirectionalDefs];

  if (allInverseDefs.length === 0) {
    return directRelations;
  }

  // 3. Get inverse relations (where entity is target in inverse definitions)
  const inverseRelations = await ctx.prisma.entityRelation.findMany({
    where: {
      tenantId,
      relationDefId: { in: allInverseDefs.map((d) => d.id) },
      targetEntityType: sourceEntityType,
      targetEntityId: sourceEntityId,
    },
    orderBy: { order: 'asc' },
    include: { relationDef: true },
  });

  // 4. Transform inverse relations to look like direct relations
  const transformedInverse = inverseRelations.map((rel) => ({
    ...rel,
    _isInverse: true,
    _displayTargetEntityId: rel.sourceEntityId,
    _displayTargetEntityType: rel.sourceEntityType,
  }));

  // 5. Combine and deduplicate
  const directTargetIds = new Set(directRelations.map((r) => r.targetEntityId));
  const uniqueInverse = transformedInverse.filter(
    (r) => !directTargetIds.has(r._displayTargetEntityId)
  );

  return [...directRelations, ...uniqueInverse];
}
