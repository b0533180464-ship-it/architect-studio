import { z } from 'zod';

// Supported entity types for custom fields
export const customFieldEntityTypeEnum = z.enum([
  'project',
  'client',
  'task',
  'supplier',
  'professional',
  'product',
  'room',
]);

export type CustomFieldEntityType = z.infer<typeof customFieldEntityTypeEnum>;

// Supported field types
export const customFieldTypeEnum = z.enum([
  'text',
  'textarea',
  'number',
  'currency',
  'date',
  'datetime',
  'boolean',
  'select',
  'multiselect',
  'url',
  'email',
  'phone',
  'user',      // Single user selection
  'users',     // Multiple users selection
]);

export type CustomFieldType = z.infer<typeof customFieldTypeEnum>;

// Option schema for select/multiselect fields
const optionSchema = z.object({
  value: z.string(),
  label: z.string(),
  color: z.string().optional(),
});

// Validation schema
const validationSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
}).optional();

// List field definitions
export const listFieldsSchema = z.object({
  entityType: customFieldEntityTypeEnum,
  activeOnly: z.boolean().default(true),
});

// Get field by ID
export const getFieldByIdSchema = z.object({
  id: z.string().cuid(),
});

// Create field definition
export const createFieldSchema = z.object({
  entityType: customFieldEntityTypeEnum,
  name: z.string().min(1, 'שם השדה הוא חובה').max(100),
  fieldKey: z.string()
    .min(1, 'מזהה השדה הוא חובה')
    .max(50)
    .regex(/^[a-z][a-z0-9_]*$/, 'מזהה השדה חייב להתחיל באות קטנה ולכלול רק אותיות, מספרים וקו תחתון'),
  fieldType: customFieldTypeEnum,
  options: z.array(optionSchema).optional(),
  isRequired: z.boolean().default(false),
  validation: validationSchema,
  defaultValue: z.string().optional(),
  placeholder: z.string().max(200).optional(),
  helpText: z.string().max(500).optional(),
  width: z.number().int().positive().optional(),
  order: z.number().int().nonnegative().optional(),
});

// Update field definition
export const updateFieldSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  fieldType: customFieldTypeEnum.optional(),
  options: z.array(optionSchema).optional().nullable(),
  isRequired: z.boolean().optional(),
  validation: validationSchema.nullable(),
  defaultValue: z.string().optional().nullable(),
  placeholder: z.string().max(200).optional().nullable(),
  helpText: z.string().max(500).optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Delete field definition
export const deleteFieldSchema = z.object({
  id: z.string().cuid(),
});

// Reorder fields
export const reorderFieldsSchema = z.object({
  entityType: customFieldEntityTypeEnum,
  ids: z.array(z.string().cuid()).min(1),
});

// Get field values for an entity
export const getValuesSchema = z.object({
  entityType: customFieldEntityTypeEnum,
  entityId: z.string().cuid(),
});

// Set field values for an entity
export const setValuesSchema = z.object({
  entityType: customFieldEntityTypeEnum,
  entityId: z.string().cuid(),
  values: z.record(z.string(), z.any()), // { fieldKey: value }
});

// Get field values for multiple entities (bulk)
export const getValuesBulkSchema = z.object({
  entityType: customFieldEntityTypeEnum,
  entityIds: z.array(z.string().cuid()),
});

// Type exports
export type ListFieldsInput = z.infer<typeof listFieldsSchema>;
export type CreateFieldInput = z.infer<typeof createFieldSchema>;
export type UpdateFieldInput = z.infer<typeof updateFieldSchema>;
export type GetValuesInput = z.infer<typeof getValuesSchema>;
export type SetValuesInput = z.infer<typeof setValuesSchema>;
