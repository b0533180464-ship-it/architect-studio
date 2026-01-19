import type { Context } from '../../trpc';
import type {
  ListEntityTypesInput,
  GetEntityTypeByIdInput,
  GetEntityTypeBySlugInput,
} from './schemas';

// Extended context with tenant info
type TenantContext = Context & {
  tenantId: string;
  userRole: string;
};

// ============================================
// List all entity types for tenant
// ============================================
export async function listEntityTypes(
  ctx: TenantContext,
  input: ListEntityTypesInput
) {
  const where = {
    tenantId: ctx.tenantId,
    ...(input.includeInactive ? {} : { isActive: true }),
  };

  return ctx.prisma.entityType.findMany({
    where,
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { entities: true },
      },
    },
  });
}

// ============================================
// Get entity type by ID
// ============================================
export async function getEntityTypeById(
  ctx: TenantContext,
  input: GetEntityTypeByIdInput
) {
  return ctx.prisma.entityType.findFirst({
    where: {
      id: input.id,
      tenantId: ctx.tenantId,
    },
    include: {
      _count: {
        select: { entities: true },
      },
    },
  });
}

// ============================================
// Get entity type by slug
// ============================================
export async function getEntityTypeBySlug(
  ctx: TenantContext,
  input: GetEntityTypeBySlugInput
) {
  return ctx.prisma.entityType.findFirst({
    where: {
      slug: input.slug,
      tenantId: ctx.tenantId,
    },
    include: {
      _count: {
        select: { entities: true },
      },
    },
  });
}
