import { TRPCError } from '@trpc/server';
import type { Context } from '../../trpc';
import type {
  CreateNavigationItemInput,
  UpdateNavigationItemInput,
  DeleteNavigationItemInput,
  ReorderNavigationInput,
  ToggleVisibilityInput,
  ToggleCollapseInput,
} from './schemas';
import { getMaxOrder, checkNavigationExists } from './queries';

// Extended context with tenant info
type TenantContext = Context & {
  tenantId: string;
  userRole: string;
};

/**
 * Create a new navigation item
 */
export async function createNavigationItem(
  ctx: TenantContext,
  input: CreateNavigationItemInput
) {
  const order = input.order ?? await getMaxOrder(ctx, input.parentId ?? null);

  const item = await ctx.prisma.navigationItem.create({
    data: {
      tenantId: ctx.tenantId,
      label: input.label,
      labelEn: input.labelEn,
      icon: input.icon,
      href: input.href,
      entityType: input.entityType,
      parentId: input.parentId,
      order,
      isVisible: input.isVisible ?? true,
      isCollapsed: input.isCollapsed ?? false,
      isSystem: false,
    },
  });

  return item;
}

/**
 * Update navigation item
 */
export async function updateNavigationItem(
  ctx: TenantContext,
  input: UpdateNavigationItemInput
) {
  // Check if item exists and belongs to tenant
  const existing = await ctx.prisma.navigationItem.findFirst({
    where: { tenantId: ctx.tenantId, id: input.id },
  });

  if (!existing) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'פריט ניווט לא נמצא',
    });
  }

  // System items can only have limited updates
  if (existing.isSystem) {
    const allowedFields = ['isVisible', 'isCollapsed', 'order'];
    const hasDisallowedFields = Object.keys(input).some(
      key => !allowedFields.includes(key) && key !== 'id' && input[key as keyof typeof input] !== undefined
    );
    if (hasDisallowedFields) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'לא ניתן לערוך פריטי מערכת',
      });
    }
  }

  const { id, ...updateData } = input;

  const item = await ctx.prisma.navigationItem.update({
    where: { id },
    data: updateData,
  });

  return item;
}

/**
 * Delete navigation item (and children)
 */
export async function deleteNavigationItem(
  ctx: TenantContext,
  input: DeleteNavigationItemInput
) {
  const existing = await ctx.prisma.navigationItem.findFirst({
    where: { tenantId: ctx.tenantId, id: input.id },
  });

  if (!existing) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'פריט ניווט לא נמצא',
    });
  }

  if (existing.isSystem) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'לא ניתן למחוק פריטי מערכת',
    });
  }

  // Delete item (children will cascade due to onDelete: Cascade)
  await ctx.prisma.navigationItem.delete({
    where: { id: input.id },
  });

  return { success: true };
}

/**
 * Reorder navigation items (batch update)
 */
export async function reorderNavigation(
  ctx: TenantContext,
  input: ReorderNavigationInput
) {
  // Update all items in a transaction
  await ctx.prisma.$transaction(
    input.items.map(item =>
      ctx.prisma.navigationItem.updateMany({
        where: {
          tenantId: ctx.tenantId,
          id: item.id,
        },
        data: {
          order: item.order,
          parentId: item.parentId,
        },
      })
    )
  );

  return { success: true };
}

/**
 * Toggle visibility
 */
export async function toggleVisibility(
  ctx: TenantContext,
  input: ToggleVisibilityInput
) {
  if (!await checkNavigationExists(ctx, input.id)) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'פריט ניווט לא נמצא',
    });
  }

  return ctx.prisma.navigationItem.update({
    where: { id: input.id },
    data: { isVisible: input.isVisible },
  });
}

/**
 * Toggle collapse state
 */
export async function toggleCollapse(
  ctx: TenantContext,
  input: ToggleCollapseInput
) {
  if (!await checkNavigationExists(ctx, input.id)) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'פריט ניווט לא נמצא',
    });
  }

  return ctx.prisma.navigationItem.update({
    where: { id: input.id },
    data: { isCollapsed: input.isCollapsed },
  });
}
