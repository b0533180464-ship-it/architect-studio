import { TRPCError } from '@trpc/server';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  listFieldsSchema,
  getFieldByIdSchema,
  createFieldSchema,
  updateFieldSchema,
  deleteFieldSchema,
  reorderFieldsSchema,
  getValuesSchema,
  setValuesSchema,
  getValuesBulkSchema,
} from './schemas';
import { parseValue } from './utils';

export const customFieldsRouter = createTRPCRouter({
  // List field definitions by entity type
  listDefinitions: tenantProcedure
    .input(listFieldsSchema)
    .query(async ({ ctx, input }) => {
      const { entityType, activeOnly } = input;

      return ctx.prisma.customFieldDefinition.findMany({
        where: {
          tenantId: ctx.tenantId,
          entityType,
          ...(activeOnly ? { isActive: true } : {}),
        },
        orderBy: { order: 'asc' },
      });
    }),

  // Get field definition by ID
  getDefinition: tenantProcedure.input(getFieldByIdSchema).query(async ({ ctx, input }) => {
    const field = await ctx.prisma.customFieldDefinition.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
    });
    if (!field) throw new TRPCError({ code: 'NOT_FOUND', message: 'שדה לא נמצא' });
    return field;
  }),

  // Create field definition
  createDefinition: tenantProcedure
    .input(createFieldSchema)
    .mutation(async ({ ctx, input }) => {
      const { entityType, order, ...data } = input;

      // Check if fieldKey already exists
      const existing = await ctx.prisma.customFieldDefinition.findFirst({
        where: {
          tenantId: ctx.tenantId,
          entityType,
          fieldKey: data.fieldKey,
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'מזהה שדה כבר קיים',
        });
      }

      // Get max order if not provided
      let finalOrder = order;
      if (finalOrder === undefined) {
        const maxOrder = await ctx.prisma.customFieldDefinition.aggregate({
          where: { tenantId: ctx.tenantId, entityType },
          _max: { order: true },
        });
        finalOrder = (maxOrder._max.order ?? -1) + 1;
      }

      return ctx.prisma.customFieldDefinition.create({
        data: {
          ...data,
          entityType,
          tenantId: ctx.tenantId,
          order: finalOrder,
        },
      });
    }),

  // Update field definition
  updateDefinition: tenantProcedure
    .input(updateFieldSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.prisma.customFieldDefinition.findFirst({
        where: { id, tenantId: ctx.tenantId },
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'שדה לא נמצא' });
      }

      // Clean up null values
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
      );

      return ctx.prisma.customFieldDefinition.update({
        where: { id },
        data: cleanData,
      });
    }),

  // Delete field definition (and all values)
  deleteDefinition: tenantProcedure
    .input(deleteFieldSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.customFieldDefinition.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'שדה לא נמצא' });
      }

      // Delete all values first (cascade should handle this, but being explicit)
      await ctx.prisma.customFieldValue.deleteMany({
        where: { fieldId: input.id, tenantId: ctx.tenantId },
      });

      return ctx.prisma.customFieldDefinition.delete({
        where: { id: input.id },
      });
    }),

  // Reorder field definitions
  reorderDefinitions: tenantProcedure
    .input(reorderFieldsSchema)
    .mutation(async ({ ctx, input }) => {
      const { entityType, ids } = input;

      const updates = ids.map((id, index) =>
        ctx.prisma.customFieldDefinition.updateMany({
          where: { id, tenantId: ctx.tenantId, entityType },
          data: { order: index },
        })
      );

      await ctx.prisma.$transaction(updates);

      return { success: true };
    }),

  // Get all field values for an entity
  getValues: tenantProcedure
    .input(getValuesSchema)
    .query(async ({ ctx, input }) => {
      const { entityType, entityId } = input;

      // Get all active field definitions for this entity type
      const definitions = await ctx.prisma.customFieldDefinition.findMany({
        where: {
          tenantId: ctx.tenantId,
          entityType,
          isActive: true,
        },
        orderBy: { order: 'asc' },
      });

      // Get all values for this entity
      const values = await ctx.prisma.customFieldValue.findMany({
        where: {
          tenantId: ctx.tenantId,
          entityType,
          entityId,
        },
      });

      // Build a map of fieldId -> value
      const valueMap = new Map(values.map((v) => [v.fieldId, v.value]));

      // Return definitions with their values
      return definitions.map((def) => ({
        ...def,
        value: valueMap.get(def.id) ?? def.defaultValue ?? null,
      }));
    }),

  // Set field values for an entity
  setValues: tenantProcedure
    .input(setValuesSchema)
    .mutation(async ({ ctx, input }) => {
      const { entityType, entityId, values } = input;

      // Get field definitions to map fieldKey -> fieldId
      const definitions = await ctx.prisma.customFieldDefinition.findMany({
        where: {
          tenantId: ctx.tenantId,
          entityType,
          isActive: true,
        },
      });

      const fieldKeyToId = new Map(definitions.map((d) => [d.fieldKey, d.id]));

      // Prepare upsert operations
      const operations = Object.entries(values)
        .filter(([fieldKey]) => fieldKeyToId.has(fieldKey))
        .map(([fieldKey, value]) => {
          const fieldId = fieldKeyToId.get(fieldKey)!;
          const stringValue = value === null || value === undefined
            ? ''
            : typeof value === 'object'
              ? JSON.stringify(value)
              : String(value);

          return ctx.prisma.customFieldValue.upsert({
            where: {
              tenantId_fieldId_entityId: {
                tenantId: ctx.tenantId,
                fieldId,
                entityId,
              },
            },
            create: {
              tenantId: ctx.tenantId,
              fieldId,
              entityType,
              entityId,
              value: stringValue,
            },
            update: {
              value: stringValue,
            },
          });
        });

      await ctx.prisma.$transaction(operations);

      return { success: true };
    }),

  // Get values as a simple key-value object
  getValuesMap: tenantProcedure
    .input(getValuesSchema)
    .query(async ({ ctx, input }) => {
      const { entityType, entityId } = input;

      const values = await ctx.prisma.customFieldValue.findMany({
        where: {
          tenantId: ctx.tenantId,
          entityType,
          entityId,
        },
        include: {
          field: {
            select: { fieldKey: true, fieldType: true },
          },
        },
      });

      // Build a simple key-value map
      const result: Record<string, unknown> = {};
      for (const v of values) {
        result[v.field.fieldKey] = parseValue(v.value, v.field.fieldType);
      }

      return result;
    }),

  // Get values for multiple entities (bulk) - returns Map<entityId, Record<fieldKey, value>>
  getValuesBulk: tenantProcedure
    .input(getValuesBulkSchema)
    .query(async ({ ctx, input }) => {
      const { entityType, entityIds } = input;

      if (entityIds.length === 0) {
        return {};
      }

      const values = await ctx.prisma.customFieldValue.findMany({
        where: {
          tenantId: ctx.tenantId,
          entityType,
          entityId: { in: entityIds },
        },
        include: {
          field: {
            select: { fieldKey: true, fieldType: true },
          },
        },
      });

      // Build a map: entityId -> { fieldKey: value }
      const result: Record<string, Record<string, unknown>> = {};
      for (const v of values) {
        const entityData = result[v.entityId] ?? (result[v.entityId] = {});
        entityData[v.field.fieldKey] = parseValue(v.value, v.field.fieldType);
      }

      return result;
    }),
});
