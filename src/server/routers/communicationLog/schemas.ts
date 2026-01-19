import { z } from 'zod';

export const communicationTypeEnum = z.enum(['email', 'phone', 'whatsapp', 'meeting', 'sms']);
export const directionEnum = z.enum(['inbound', 'outbound']);

export const listCommunicationsSchema = z.object({
  clientId: z.string().cuid(),
  type: communicationTypeEnum.optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export const createCommunicationSchema = z.object({
  clientId: z.string().cuid(),
  type: communicationTypeEnum,
  direction: directionEnum,
  subject: z.string().max(255).optional(),
  content: z.string().min(1),
});

export type ListCommunicationsInput = z.infer<typeof listCommunicationsSchema>;
export type CreateCommunicationInput = z.infer<typeof createCommunicationSchema>;
