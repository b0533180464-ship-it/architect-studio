import { TRPCError } from '@trpc/server';
import type { PrismaClient } from '@prisma/client';

type Context = {
  prisma: PrismaClient;
  tenantId: string;
  auth: { user: { id: string } };
};

// List views for entity type
export async function listViews(
  ctx: Context,
  input: { entityType: string; includeShared: boolean }
) {
  const { entityType, includeShared } = input;
  const userId = ctx.auth.user.id;

  const where = {
    tenantId: ctx.tenantId,
    entityType,
    OR: [
      { userId },
      ...(includeShared ? [{ isShared: true }] : []),
    ],
  };

  return ctx.prisma.viewConfiguration.findMany({
    where,
    orderBy: [
      { isDefault: 'desc' },
      { name: 'asc' },
    ],
    include: {
      user: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

// Get view by ID
export async function getViewById(ctx: Context, input: { id: string }) {
  const userId = ctx.auth.user.id;

  const view = await ctx.prisma.viewConfiguration.findFirst({
    where: {
      id: input.id,
      tenantId: ctx.tenantId,
      OR: [
        { userId },
        { isShared: true },
      ],
    },
  });

  if (!view) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'תצוגה לא נמצאה' });
  }

  return view;
}

// Get default view
export async function getDefaultView(ctx: Context, input: { entityType: string }) {
  const userId = ctx.auth.user.id;

  const userDefault = await ctx.prisma.viewConfiguration.findFirst({
    where: {
      tenantId: ctx.tenantId,
      entityType: input.entityType,
      userId,
      isDefault: true,
    },
  });

  if (userDefault) return userDefault;

  return ctx.prisma.viewConfiguration.findFirst({
    where: {
      tenantId: ctx.tenantId,
      entityType: input.entityType,
      isShared: true,
      isDefault: true,
    },
  });
}
