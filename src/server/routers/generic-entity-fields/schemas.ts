import { z } from 'zod';

// Field types (same as customFields)
export const fieldTypeEnum = z.enum([
  'text', 'textarea', 'number', 'currency', 'date', 'datetime',
  'boolean', 'select', 'multiselect', 'url', 'email', 'phone',
  'user', 'users',
]);

export type FieldType = z.infer<typeof fieldTypeEnum>;

// Option schema for select/multiselect
const optionSchema = z.object({
  value: z.string(),
  label: z.string(),
  color: z.string().optional(),
});

// List fields by entity type slug
export const listFieldsSchema = z.object({
  entityTypeSlug: z.string().min(1),
  activeOnly: z.boolean().default(true),
});

// Create field
export const createFieldSchema = z.object({
  entityTypeSlug: z.string().min(1),
  name: z.string().min(1, 'שם השדה הוא חובה').max(100),
  fieldKey: z.string()
    .min(1)
    .max(50)
    .regex(/^[a-z][a-z0-9_]*$/, 'מזהה חייב להתחיל באות קטנה'),
  fieldType: fieldTypeEnum,
  options: z.array(optionSchema).optional(),
  isRequired: z.boolean().default(false),
  width: z.number().int().positive().optional(),
  order: z.number().int().nonnegative().optional(),
});

// Update field
export const updateFieldSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  fieldType: fieldTypeEnum.optional(),
  options: z.array(optionSchema).optional().nullable(),
  isRequired: z.boolean().optional(),
  width: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Delete field
export const deleteFieldSchema = z.object({
  id: z.string().cuid(),
});

// Reorder fields
export const reorderFieldsSchema = z.object({
  entityTypeSlug: z.string().min(1),
  ids: z.array(z.string().cuid()).min(1),
});
