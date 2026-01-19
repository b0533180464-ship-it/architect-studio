import { z } from 'zod';

// Enums
export const roomDesignStatusEnum = z.enum([
  'not_started', 'concept', 'detailed', 'approved', 'in_progress', 'completed',
]);

// Create room input
export const createRoomSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(1, 'שם החדר הוא שדה חובה').max(100),
  typeId: z.string().cuid().optional(),
  statusId: z.string().cuid().optional(),
  area: z.number().positive().optional(),
  budget: z.number().nonnegative().optional(),
  designStatus: roomDesignStatusEnum.default('not_started'),
  notes: z.string().optional(),
  order: z.number().int().nonnegative().default(0),
});

// Update room input
export const updateRoomSchema = createRoomSchema.partial().omit({ projectId: true }).extend({
  id: z.string().cuid(),
});

// List rooms input
export const listRoomsSchema = z.object({
  projectId: z.string().cuid(),
});

// Get room by ID
export const getRoomByIdSchema = z.object({
  id: z.string().cuid(),
});

// Delete room
export const deleteRoomSchema = z.object({
  id: z.string().cuid(),
});

// Reorder rooms
export const reorderRoomsSchema = z.object({
  projectId: z.string().cuid(),
  roomIds: z.array(z.string().cuid()),
});

// Type exports
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
