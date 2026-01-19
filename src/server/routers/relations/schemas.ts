import { z } from 'zod';

// Relation type enum
export const relationTypeEnum = z.enum(['one_to_one', 'one_to_many', 'many_to_many']);

// List relation definitions
export const listRelationDefsSchema = z.object({
  sourceEntityType: z.string().min(1).optional(),
  targetEntityType: z.string().min(1).optional(), // Filter: includes this target type
  activeOnly: z.boolean().default(true),
});

// Get relation definition by ID
export const getRelationDefByIdSchema = z.object({
  id: z.string().cuid(),
});

// Create relation definition
export const createRelationDefSchema = z.object({
  name: z.string().min(1, 'שם הקשר הוא חובה').max(100),
  fieldKey: z.string().min(1).max(50).regex(/^[a-z][a-z0-9_]*$/, 'מפתח לא תקין'),
  sourceEntityType: z.string().min(1),
  targetEntityTypes: z.array(z.string().min(1)).min(1, 'יש לבחור לפחות לוח יעד אחד'),
  relationType: relationTypeEnum.default('many_to_many'),
  isBidirectional: z.boolean().default(false),
  inverseName: z.string().max(100).optional(),
  displayFields: z.array(z.string()).optional(),
});

// Update relation definition
export const updateRelationDefSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  targetEntityTypes: z.array(z.string().min(1)).min(1).optional(),
  isBidirectional: z.boolean().optional(),
  inverseName: z.string().max(100).optional().nullable(),
  displayFields: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().optional(),
});

// Delete relation definition
export const deleteRelationDefSchema = z.object({
  id: z.string().cuid(),
});

// List entity relations for a source
export const listEntityRelationsSchema = z.object({
  relationDefId: z.string().cuid().optional(),
  sourceEntityType: z.string().min(1),
  sourceEntityId: z.string().min(1),
});

// Add entity relation
export const addEntityRelationSchema = z.object({
  relationDefId: z.string().cuid(),
  sourceEntityType: z.string().min(1),
  sourceEntityId: z.string().min(1),
  targetEntityType: z.string().min(1),
  targetEntityId: z.string().min(1),
  order: z.number().int().nonnegative().default(0),
});

// Remove entity relation
export const removeEntityRelationSchema = z.object({
  id: z.string().cuid(),
});

// Reorder entity relations
export const reorderEntityRelationsSchema = z.object({
  relationDefId: z.string().cuid(),
  sourceEntityId: z.string().min(1),
  orderedTargetIds: z.array(z.string().min(1)),
});

// Type exports
export type RelationType = z.infer<typeof relationTypeEnum>;
