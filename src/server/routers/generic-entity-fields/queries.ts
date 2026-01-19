import type { Context } from '../../trpc';
import { listFieldsSchema } from './schemas';
import type { z } from 'zod';

type TenantContext = Context & { tenantId: string; userRole: string };
type ListFieldsInput = z.infer<typeof listFieldsSchema>;

const getEntityTypeKey = (slug: string) => `generic:${slug}`;

export async function listFields(ctx: TenantContext, input: ListFieldsInput) {
  const { entityTypeSlug, activeOnly } = input;
  const entityType = getEntityTypeKey(entityTypeSlug);

  const fields = await ctx.prisma.customFieldDefinition.findMany({
    where: {
      tenantId: ctx.tenantId,
      entityType,
      ...(activeOnly ? { isActive: true } : {}),
    },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      fieldKey: true,
      name: true,
      fieldType: true,
      options: true,
      isRequired: true,
      defaultValue: true,
      placeholder: true,
      width: true,
      order: true,
    },
  });

  return fields;
}

export async function getFieldById(ctx: TenantContext, id: string) {
  const field = await ctx.prisma.customFieldDefinition.findFirst({
    where: { id, tenantId: ctx.tenantId },
  });

  if (!field) {
    throw new Error('שדה לא נמצא');
  }

  return field;
}
