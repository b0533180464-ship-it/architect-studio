import type { Context } from '../../trpc';
import { listViewsSchema, getViewByIdSchema } from './schemas';
import type { z } from 'zod';
import type { AuthContext } from '@/lib/auth';

type TenantContext = Context & { tenantId: string; userRole: string; auth: AuthContext };
type ListViewsInput = z.infer<typeof listViewsSchema>;
type GetViewByIdInput = z.infer<typeof getViewByIdSchema>;

const getEntityTypeKey = (slug: string) => `generic:${slug}`;

export async function listViews(ctx: TenantContext, input: ListViewsInput) {
  const { entityTypeSlug, includeShared } = input;
  const entityType = getEntityTypeKey(entityTypeSlug);
  const userId = ctx.auth.user.id;

  const where = {
    tenantId: ctx.tenantId,
    entityType,
    OR: includeShared
      ? [{ userId }, { isShared: true }]
      : [{ userId }],
  };

  const views = await ctx.prisma.viewConfiguration.findMany({
    where,
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      isDefault: true,
      isShared: true,
      userId: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  return views;
}

export async function getViewById(ctx: TenantContext, input: GetViewByIdInput) {
  const userId = ctx.auth.user.id;

  const view = await ctx.prisma.viewConfiguration.findFirst({
    where: {
      id: input.id,
      tenantId: ctx.tenantId,
      OR: [{ userId }, { isShared: true }],
    },
  });

  if (!view) {
    throw new Error('תצוגה לא נמצאה');
  }

  return view;
}

export async function getDefaultView(ctx: TenantContext, entityTypeSlug: string) {
  const entityType = getEntityTypeKey(entityTypeSlug);
  const userId = ctx.auth.user.id;

  const view = await ctx.prisma.viewConfiguration.findFirst({
    where: {
      tenantId: ctx.tenantId,
      entityType,
      isDefault: true,
      OR: [{ userId }, { isShared: true }],
    },
    orderBy: { userId: 'desc' },
  });

  return view;
}
