import { TRPCError } from '@trpc/server';
import type { Prisma, PrismaClient } from '@prisma/client';

type Context = {
  prisma: PrismaClient;
  tenantId: string;
  auth: { user: { id: string } };
};

// Create view
export async function createView(
  ctx: Context,
  input: {
    entityType: string;
    name: string;
    viewType: string;
    isDefault: boolean;
    isShared: boolean;
    columns: unknown[];
    sortBy?: string;
    sortOrder?: string;
    filters?: unknown[];
    groupBy?: string;
  }
) {
  const userId = ctx.auth.user.id;
  const { isDefault, ...data } = input;

  if (isDefault) {
    await ctx.prisma.viewConfiguration.updateMany({
      where: {
        tenantId: ctx.tenantId,
        entityType: input.entityType,
        userId,
        isDefault: true,
      },
      data: { isDefault: false },
    });
  }

  return ctx.prisma.viewConfiguration.create({
    data: {
      ...data,
      columns: data.columns as Prisma.InputJsonValue,
      filters: data.filters as Prisma.InputJsonValue | undefined,
      isDefault,
      tenantId: ctx.tenantId,
      userId,
    },
  });
}

// Update view
export async function updateView(
  ctx: Context,
  input: {
    id: string;
    name?: string;
    viewType?: string;
    isDefault?: boolean;
    isShared?: boolean;
    columns?: unknown[];
    sortBy?: string | null;
    sortOrder?: string | null;
    filters?: unknown[] | null;
    groupBy?: string | null;
  }
) {
  const userId = ctx.auth.user.id;
  const { id, isDefault, ...data } = input;

  const existing = await ctx.prisma.viewConfiguration.findFirst({
    where: { id, tenantId: ctx.tenantId },
  });

  if (!existing) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'תצוגה לא נמצאה' });
  }

  if (existing.userId !== userId && existing.userId !== null) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'אין הרשאה לערוך תצוגה זו',
    });
  }

  if (isDefault) {
    await ctx.prisma.viewConfiguration.updateMany({
      where: {
        tenantId: ctx.tenantId,
        entityType: existing.entityType,
        userId,
        isDefault: true,
        id: { not: id },
      },
      data: { isDefault: false },
    });
  }

  const cleanData = Object.fromEntries(
    Object.entries({ ...data, isDefault }).filter(([, v]) => v !== undefined)
  );

  return ctx.prisma.viewConfiguration.update({
    where: { id },
    data: cleanData,
  });
}

// Delete view
export async function deleteView(ctx: Context, input: { id: string }) {
  const userId = ctx.auth.user.id;

  const existing = await ctx.prisma.viewConfiguration.findFirst({
    where: { id: input.id, tenantId: ctx.tenantId },
  });

  if (!existing) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'תצוגה לא נמצאה' });
  }

  if (existing.userId !== userId && existing.userId !== null) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'אין הרשאה למחוק תצוגה זו',
    });
  }

  return ctx.prisma.viewConfiguration.delete({
    where: { id: input.id },
  });
}

// Duplicate view
export async function duplicateView(
  ctx: Context,
  input: { id: string; name: string }
) {
  const userId = ctx.auth.user.id;

  const original = await ctx.prisma.viewConfiguration.findFirst({
    where: {
      id: input.id,
      tenantId: ctx.tenantId,
      OR: [{ userId }, { isShared: true }],
    },
  });

  if (!original) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'תצוגה לא נמצאה' });
  }

  const copyData: Prisma.ViewConfigurationCreateInput = {
    name: input.name,
    entityType: original.entityType,
    viewType: original.viewType,
    columns: original.columns as Prisma.InputJsonValue,
    sortBy: original.sortBy,
    sortOrder: original.sortOrder,
    filters: original.filters as Prisma.InputJsonValue | undefined,
    groupBy: original.groupBy,
    isDefault: false,
    isShared: false,
    tenant: { connect: { id: ctx.tenantId } },
    user: { connect: { id: userId } },
  };

  return ctx.prisma.viewConfiguration.create({ data: copyData });
}

// Set default view
export async function setDefaultView(
  ctx: Context,
  input: { entityType: string; viewId: string | null }
) {
  const userId = ctx.auth.user.id;
  const { entityType, viewId } = input;

  await ctx.prisma.viewConfiguration.updateMany({
    where: {
      tenantId: ctx.tenantId,
      entityType,
      userId,
      isDefault: true,
    },
    data: { isDefault: false },
  });

  if (viewId) {
    const view = await ctx.prisma.viewConfiguration.findFirst({
      where: {
        id: viewId,
        tenantId: ctx.tenantId,
        OR: [{ userId }, { isShared: true }],
      },
    });

    if (!view) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'תצוגה לא נמצאה' });
    }

    if (view.userId !== userId) {
      const copyData: Prisma.ViewConfigurationCreateInput = {
        name: view.name,
        entityType: view.entityType,
        viewType: view.viewType,
        columns: view.columns as Prisma.InputJsonValue,
        sortBy: view.sortBy,
        sortOrder: view.sortOrder,
        filters: view.filters as Prisma.InputJsonValue | undefined,
        groupBy: view.groupBy,
        isDefault: true,
        isShared: false,
        tenant: { connect: { id: ctx.tenantId } },
        user: { connect: { id: userId } },
      };

      await ctx.prisma.viewConfiguration.create({ data: copyData });
    } else {
      await ctx.prisma.viewConfiguration.update({
        where: { id: viewId },
        data: { isDefault: true },
      });
    }
  }

  return { success: true };
}

// Quick save view
export async function quickSaveView(
  ctx: Context,
  input: {
    id: string;
    columns?: unknown[];
    sortBy?: string | null;
    sortOrder?: string | null;
    filters?: unknown[] | null;
    groupBy?: string | null;
  }
) {
  const userId = ctx.auth.user.id;
  const { id, ...data } = input;

  const existing = await ctx.prisma.viewConfiguration.findFirst({
    where: { id, tenantId: ctx.tenantId, userId },
  });

  if (!existing) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'תצוגה לא נמצאה או אין הרשאה לערוך',
    });
  }

  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );

  return ctx.prisma.viewConfiguration.update({
    where: { id },
    data: cleanData,
  });
}
