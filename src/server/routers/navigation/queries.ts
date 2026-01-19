import type { Context } from '../../trpc';
import type {
  ListNavigationInput,
  GetNavigationByIdInput,
  NavigationItemWithChildren,
} from './schemas';

// Extended context with tenant info
type TenantContext = Context & {
  tenantId: string;
  userRole: string;
};

/**
 * Get all navigation items for tenant (flat list)
 */
export async function listNavigation(
  ctx: TenantContext,
  input: ListNavigationInput
) {
  const { includeHidden } = input;

  const items = await ctx.prisma.navigationItem.findMany({
    where: {
      tenantId: ctx.tenantId,
      ...(includeHidden ? {} : { isVisible: true }),
    },
    orderBy: [
      { parentId: 'asc' },
      { order: 'asc' },
    ],
  });

  return items;
}

/**
 * Get navigation items as tree structure
 */
export async function listNavigationTree(
  ctx: TenantContext,
  input: ListNavigationInput
): Promise<NavigationItemWithChildren[]> {
  const items = await listNavigation(ctx, input);

  // Build tree structure
  const itemMap = new Map<string, NavigationItemWithChildren>();
  const roots: NavigationItemWithChildren[] = [];

  // First pass: create map
  for (const item of items) {
    itemMap.set(item.id, { ...item, children: [] });
  }

  // Second pass: build tree
  for (const item of items) {
    const node = itemMap.get(item.id)!;
    if (item.parentId && itemMap.has(item.parentId)) {
      const parent = itemMap.get(item.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * Get single navigation item by ID
 */
export async function getNavigationById(
  ctx: TenantContext,
  input: GetNavigationByIdInput
) {
  const item = await ctx.prisma.navigationItem.findFirst({
    where: {
      tenantId: ctx.tenantId,
      id: input.id,
    },
    include: {
      children: {
        orderBy: { order: 'asc' },
      },
      parent: true,
    },
  });

  return item;
}

/**
 * Get max order for a parent (or root level)
 */
export async function getMaxOrder(
  ctx: TenantContext,
  parentId: string | null
): Promise<number> {
  const result = await ctx.prisma.navigationItem.aggregate({
    where: {
      tenantId: ctx.tenantId,
      parentId: parentId,
    },
    _max: {
      order: true,
    },
  });

  return (result._max.order ?? -1) + 1;
}

/**
 * Check if navigation item exists and belongs to tenant
 */
export async function checkNavigationExists(
  ctx: TenantContext,
  id: string
): Promise<boolean> {
  const count = await ctx.prisma.navigationItem.count({
    where: {
      tenantId: ctx.tenantId,
      id,
    },
  });

  return count > 0;
}
