import type { Context } from '../../trpc';
import type { ListEntitiesInput, GetEntityByIdInput } from './schemas';

// Extended context with tenant info
type TenantContext = Context & {
  tenantId: string;
  userRole: string;
  auth: { user: { id: string } };
};

// ============================================
// List entities by type
// ============================================
export async function listEntities(
  ctx: TenantContext,
  input: ListEntitiesInput
) {
  const { entityTypeId, includeInactive, sortBy, sortOrder, limit, offset } = input;

  const where = {
    tenantId: ctx.tenantId,
    entityTypeId,
    ...(includeInactive ? {} : { isActive: true }),
  };

  const orderBy = sortBy === 'name'
    ? { name: sortOrder }
    : sortBy === 'createdAt'
    ? { createdAt: sortOrder }
    : { createdAt: 'desc' as const };

  const [entities, total] = await Promise.all([
    ctx.prisma.genericEntity.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        entityType: {
          select: { name: true, slug: true, icon: true, color: true },
        },
      },
    }),
    ctx.prisma.genericEntity.count({ where }),
  ]);

  return {
    entities,
    total,
    hasMore: offset + entities.length < total,
  };
}

// ============================================
// Get entity by ID
// ============================================
export async function getEntityById(
  ctx: TenantContext,
  input: GetEntityByIdInput
) {
  return ctx.prisma.genericEntity.findFirst({
    where: {
      id: input.id,
      tenantId: ctx.tenantId,
    },
    include: {
      entityType: {
        select: { name: true, slug: true, icon: true, color: true },
      },
    },
  });
}
