import { TRPCError } from '@trpc/server';
import type { Context } from '../../trpc';
import type {
  CreateEntityTypeInput,
  UpdateEntityTypeInput,
  DeleteEntityTypeInput,
} from './schemas';

// Extended context with tenant info
type TenantContext = Context & {
  tenantId: string;
  userRole: string;
};

// ============================================
// Create new entity type
// ============================================
export async function createEntityType(
  ctx: TenantContext,
  input: CreateEntityTypeInput
) {
  // Check if slug already exists
  const existing = await ctx.prisma.entityType.findFirst({
    where: { tenantId: ctx.tenantId, slug: input.slug },
  });

  if (existing) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: `Entity type with slug "${input.slug}" already exists`,
    });
  }

  return ctx.prisma.entityType.create({
    data: {
      tenantId: ctx.tenantId,
      name: input.name,
      namePlural: input.namePlural,
      nameEn: input.nameEn,
      slug: input.slug,
      icon: input.icon,
      color: input.color,
      description: input.description,
      showInNav: input.showInNav ?? true,
      navParentId: input.navParentId,
    },
  });
}

// ============================================
// Update entity type
// ============================================
export async function updateEntityType(
  ctx: TenantContext,
  input: UpdateEntityTypeInput
) {
  const existing = await ctx.prisma.entityType.findFirst({
    where: { id: input.id, tenantId: ctx.tenantId },
  });

  if (!existing) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Entity type not found',
    });
  }

  // If updating slug, check for conflicts
  if (input.slug && input.slug !== existing.slug) {
    const slugExists = await ctx.prisma.entityType.findFirst({
      where: { tenantId: ctx.tenantId, slug: input.slug, id: { not: input.id } },
    });

    if (slugExists) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `Entity type with slug "${input.slug}" already exists`,
      });
    }
  }

  const { id, ...updateData } = input;

  return ctx.prisma.entityType.update({
    where: { id },
    data: updateData,
  });
}

// ============================================
// Delete entity type
// ============================================
export async function deleteEntityType(
  ctx: TenantContext,
  input: DeleteEntityTypeInput
) {
  const existing = await ctx.prisma.entityType.findFirst({
    where: { id: input.id, tenantId: ctx.tenantId },
    include: { _count: { select: { entities: true } } },
  });

  if (!existing) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Entity type not found',
    });
  }

  if (existing.isSystem) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Cannot delete system entity type',
    });
  }

  if (existing._count.entities > 0) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: `Cannot delete entity type with ${existing._count.entities} existing records`,
    });
  }

  return ctx.prisma.entityType.delete({
    where: { id: input.id },
  });
}
