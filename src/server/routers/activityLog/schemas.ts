import { z } from 'zod';

export const entityTypeEnum = z.enum([
  'project', 'task', 'document', 'meeting', 'client', 'supplier', 'professional',
]);

export const listActivitySchema = z.object({
  entityType: entityTypeEnum,
  entityId: z.string().cuid(),
  limit: z.number().int().min(1).max(100).default(50),
});

export const createActivitySchema = z.object({
  entityType: entityTypeEnum,
  entityId: z.string().cuid(),
  action: z.string().min(1).max(50),
  metadata: z.record(z.unknown()).optional(),
});

export type ListActivityInput = z.infer<typeof listActivitySchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
