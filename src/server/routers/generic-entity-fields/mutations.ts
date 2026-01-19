import type { Context } from '../../trpc';
import { Prisma } from '@prisma/client';
import {
  createFieldSchema,
  updateFieldSchema,
  deleteFieldSchema,
  reorderFieldsSchema,
} from './schemas';
import type { z } from 'zod';

type TenantContext = Context & { tenantId: string; userRole: string };
type CreateFieldInput = z.infer<typeof createFieldSchema>;
type UpdateFieldInput = z.infer<typeof updateFieldSchema>;
type DeleteFieldInput = z.infer<typeof deleteFieldSchema>;
type ReorderFieldsInput = z.infer<typeof reorderFieldsSchema>;

const getEntityTypeKey = (slug: string) => `generic:${slug}`;

export async function createField(ctx: TenantContext, input: CreateFieldInput) {
  const { entityTypeSlug, ...data } = input;
  const entityType = getEntityTypeKey(entityTypeSlug);

  const existing = await ctx.prisma.customFieldDefinition.findFirst({
    where: { tenantId: ctx.tenantId, entityType, fieldKey: data.fieldKey },
  });

  if (existing) {
    throw new Error('שדה עם מזהה זה כבר קיים');
  }

  const maxOrder = await ctx.prisma.customFieldDefinition.aggregate({
    where: { tenantId: ctx.tenantId, entityType },
    _max: { order: true },
  });

  return ctx.prisma.customFieldDefinition.create({
    data: {
      tenantId: ctx.tenantId,
      entityType,
      name: data.name,
      fieldKey: data.fieldKey,
      fieldType: data.fieldType,
      options: data.options as Prisma.InputJsonValue ?? Prisma.JsonNull,
      isRequired: data.isRequired ?? false,
      width: data.width,
      order: data.order ?? (maxOrder._max.order ?? -1) + 1,
    },
  });
}

export async function updateField(ctx: TenantContext, input: UpdateFieldInput) {
  const { id, ...data } = input;

  const field = await ctx.prisma.customFieldDefinition.findFirst({
    where: { id, tenantId: ctx.tenantId },
  });

  if (!field) {
    throw new Error('שדה לא נמצא');
  }

  const updateData: Prisma.CustomFieldDefinitionUpdateInput = {
    name: data.name,
    fieldType: data.fieldType,
    isRequired: data.isRequired,
    width: data.width,
    isActive: data.isActive,
  };

  if (data.options !== undefined) {
    updateData.options = data.options === null
      ? Prisma.JsonNull
      : (data.options as Prisma.InputJsonValue);
  }

  return ctx.prisma.customFieldDefinition.update({ where: { id }, data: updateData });
}

export async function deleteField(ctx: TenantContext, input: DeleteFieldInput) {
  const field = await ctx.prisma.customFieldDefinition.findFirst({
    where: { id: input.id, tenantId: ctx.tenantId },
  });

  if (!field) {
    throw new Error('שדה לא נמצא');
  }

  await ctx.prisma.customFieldValue.deleteMany({
    where: { fieldId: input.id, tenantId: ctx.tenantId },
  });

  await ctx.prisma.customFieldDefinition.delete({ where: { id: input.id } });
  return { success: true };
}

export async function reorderFields(ctx: TenantContext, input: ReorderFieldsInput) {
  const { entityTypeSlug, ids } = input;
  const entityType = getEntityTypeKey(entityTypeSlug);

  const fields = await ctx.prisma.customFieldDefinition.findMany({
    where: { id: { in: ids }, tenantId: ctx.tenantId, entityType },
  });

  if (fields.length !== ids.length) {
    throw new Error('חלק מהשדות לא נמצאו');
  }

  await Promise.all(
    ids.map((id, index) =>
      ctx.prisma.customFieldDefinition.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  return { success: true };
}
