import { TRPCError } from '@trpc/server';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  createRoomSchema,
  updateRoomSchema,
  listRoomsSchema,
  getRoomByIdSchema,
  deleteRoomSchema,
  reorderRoomsSchema,
} from './schemas';

export const roomRouter = createTRPCRouter({
  // List rooms in project
  list: tenantProcedure.input(listRoomsSchema).query(async ({ ctx, input }) => {
    const { projectId } = input;

    // Verify project exists and belongs to tenant
    const project = await ctx.prisma.project.findFirst({
      where: { id: projectId, tenantId: ctx.tenantId },
    });

    if (!project) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });
    }

    const [rooms, roomTypes, roomStatuses] = await Promise.all([
      ctx.prisma.room.findMany({
        where: { projectId, tenantId: ctx.tenantId },
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      }),
      ctx.prisma.configurableEntity.findMany({
        where: { tenantId: ctx.tenantId, entityType: 'room_type' },
      }),
      ctx.prisma.configurableEntity.findMany({
        where: { tenantId: ctx.tenantId, entityType: 'room_status' },
      }),
    ]);

    const typeMap = new Map(roomTypes.map((t) => [t.id, t]));
    const statusMap = new Map(roomStatuses.map((s) => [s.id, s]));

    return rooms.map((room) => ({
      ...room,
      roomType: room.typeId ? typeMap.get(room.typeId) : null,
      roomStatus: room.statusId ? statusMap.get(room.statusId) : null,
      tasksCount: room._count.tasks,
    }));
  }),

  // Get room by ID
  getById: tenantProcedure.input(getRoomByIdSchema).query(async ({ ctx, input }) => {
    const { id } = input;

    const [room, roomTypes, roomStatuses] = await Promise.all([
      ctx.prisma.room.findFirst({
        where: { id, tenantId: ctx.tenantId },
        include: {
          project: {
            select: { id: true, name: true },
          },
          _count: {
            select: { tasks: true },
          },
        },
      }),
      ctx.prisma.configurableEntity.findMany({
        where: { tenantId: ctx.tenantId, entityType: 'room_type' },
      }),
      ctx.prisma.configurableEntity.findMany({
        where: { tenantId: ctx.tenantId, entityType: 'room_status' },
      }),
    ]);

    if (!room) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'חדר לא נמצא' });
    }

    const typeMap = new Map(roomTypes.map((t) => [t.id, t]));
    const statusMap = new Map(roomStatuses.map((s) => [s.id, s]));

    return {
      ...room,
      roomType: room.typeId ? typeMap.get(room.typeId) : null,
      roomStatus: room.statusId ? statusMap.get(room.statusId) : null,
      tasksCount: room._count.tasks,
    };
  }),

  // Create room
  create: tenantProcedure.input(createRoomSchema).mutation(async ({ ctx, input }) => {
    const { projectId, ...data } = input;

    // Verify project exists and belongs to tenant
    const project = await ctx.prisma.project.findFirst({
      where: { id: projectId, tenantId: ctx.tenantId },
    });

    if (!project) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });
    }

    // Get max order for this project
    const maxOrder = await ctx.prisma.room.aggregate({
      where: { projectId, tenantId: ctx.tenantId },
      _max: { order: true },
    });

    return ctx.prisma.room.create({
      data: {
        ...data,
        projectId,
        tenantId: ctx.tenantId,
        order: data.order || (maxOrder._max.order ?? -1) + 1,
      },
    });
  }),

  // Update room
  update: tenantProcedure.input(updateRoomSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;

    // Verify room exists and belongs to tenant
    const existing = await ctx.prisma.room.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });

    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'חדר לא נמצא' });
    }

    return ctx.prisma.room.update({
      where: { id },
      data,
    });
  }),

  // Delete room
  delete: tenantProcedure.input(deleteRoomSchema).mutation(async ({ ctx, input }) => {
    const { id } = input;

    // Verify room exists and belongs to tenant
    const existing = await ctx.prisma.room.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });

    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'חדר לא נמצא' });
    }

    return ctx.prisma.room.delete({
      where: { id },
    });
  }),

  // Reorder rooms
  reorder: tenantProcedure.input(reorderRoomsSchema).mutation(async ({ ctx, input }) => {
    const { projectId, roomIds } = input;

    // Verify project exists and belongs to tenant
    const project = await ctx.prisma.project.findFirst({
      where: { id: projectId, tenantId: ctx.tenantId },
    });

    if (!project) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });
    }

    // Update order for each room
    const updates = roomIds.map((roomId, index) =>
      ctx.prisma.room.updateMany({
        where: { id: roomId, projectId, tenantId: ctx.tenantId },
        data: { order: index },
      })
    );

    await ctx.prisma.$transaction(updates);

    return { success: true };
  }),
});
