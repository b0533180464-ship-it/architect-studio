import { z } from 'zod';

export const sessionIdSchema = z.object({
  sessionId: z.string(),
});

export const revokeSessionSchema = z.object({
  sessionId: z.string(),
  reason: z.string().optional(),
});
