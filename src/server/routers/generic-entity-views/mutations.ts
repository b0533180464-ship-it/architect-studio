import type { Context } from '../../trpc';
import type { AuthContext } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import {
  createViewSchema,
  updateViewSchema,
  deleteViewSchema,
  duplicateViewSchema,
  setDefaultViewSchema,
} from './schemas';
import type { z } from 'zod';

type TenantContext = Context & { tenantId: string; userRole: string; auth: AuthContext };
type CreateViewInput = z.infer<typeof createViewSchema>;
type UpdateViewInput = z.infer<typeof updateViewSchema>;
type DeleteViewInput = z.infer<typeof deleteViewSchema>;
type DuplicateViewInput = z.infer<typeof duplicateViewSchema>;
type SetDefaultViewInput = z.infer<typeof setDefaultViewSchema>;

const getEntityTypeKey = (slug: string) => `generic:${slug}`;

export async function createView(ctx: TenantContext, input: CreateViewInput) {
  const { entityTypeSlug, ...rest } = input;
  const entityType = getEntityTypeKey(entityTypeSlug);
  const userId = ctx.auth.user.id;

  return ctx.prisma.viewConfiguration.create({
    data: {
      tenantId: ctx.tenantId,
      userId,
      entityType,
      viewType: 'table',
      name: rest.name,
      isDefault: rest.isDefault ?? false,
      isShared: rest.isShared ?? false,
      columns: rest.columns as Prisma.InputJsonValue,
      sortBy: rest.sortBy,
      sortOrder: rest.sortOrder,
      filters: (rest.filters ?? []) as Prisma.InputJsonValue,
    },
  });
}

export async function updateView(ctx: TenantContext, input: UpdateViewInput) {
  const { id, ...data } = input;
  const userId = ctx.auth.user.id;

  const view = await ctx.prisma.viewConfiguration.findFirst({
    where: { id, tenantId: ctx.tenantId, userId },
  });

  if (!view) {
    throw new Error('תצוגה לא נמצאה או אין הרשאה');
  }

  const updateData: Prisma.ViewConfigurationUpdateInput = {
    name: data.name,
    isDefault: data.isDefault,
    isShared: data.isShared,
    sortBy: data.sortBy,
    sortOrder: data.sortOrder,
  };

  if (data.columns !== undefined) {
    updateData.columns = data.columns as Prisma.InputJsonValue;
  }
  if (data.filters !== undefined) {
    updateData.filters = data.filters === null
      ? Prisma.JsonNull
      : (data.filters as Prisma.InputJsonValue);
  }

  return ctx.prisma.viewConfiguration.update({ where: { id }, data: updateData });
}

export async function deleteView(ctx: TenantContext, input: DeleteViewInput) {
  const userId = ctx.auth.user.id;

  const view = await ctx.prisma.viewConfiguration.findFirst({
    where: { id: input.id, tenantId: ctx.tenantId, userId },
  });

  if (!view) {
    throw new Error('תצוגה לא נמצאה או אין הרשאה');
  }

  await ctx.prisma.viewConfiguration.delete({ where: { id: input.id } });
  return { success: true };
}

export async function duplicateView(ctx: TenantContext, input: DuplicateViewInput) {
  const userId = ctx.auth.user.id;

  const original = await ctx.prisma.viewConfiguration.findFirst({
    where: {
      id: input.id,
      tenantId: ctx.tenantId,
      OR: [{ userId }, { isShared: true }],
    },
  });

  if (!original) {
    throw new Error('תצוגה לא נמצאה');
  }

  return ctx.prisma.viewConfiguration.create({
    data: {
      tenantId: ctx.tenantId,
      userId,
      entityType: original.entityType,
      viewType: original.viewType,
      name: input.name,
      isDefault: false,
      isShared: false,
      columns: original.columns ?? Prisma.JsonNull,
      sortBy: original.sortBy,
      sortOrder: original.sortOrder,
      filters: original.filters ?? Prisma.JsonNull,
      groupBy: original.groupBy,
    },
  });
}

export async function setDefaultView(ctx: TenantContext, input: SetDefaultViewInput) {
  const entityType = getEntityTypeKey(input.entityTypeSlug);
  const userId = ctx.auth.user.id;

  await ctx.prisma.viewConfiguration.updateMany({
    where: { tenantId: ctx.tenantId, userId, entityType, isDefault: true },
    data: { isDefault: false },
  });

  if (input.viewId) {
    await ctx.prisma.viewConfiguration.update({
      where: { id: input.viewId },
      data: { isDefault: true },
    });
  }

  return { success: true };
}
