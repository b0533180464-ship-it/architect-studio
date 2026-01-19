import { TRPCError } from '@trpc/server';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import { listCommunicationsSchema, createCommunicationSchema } from './schemas';

export const communicationLogRouter = createTRPCRouter({
  // List communications for a client
  list: tenantProcedure.input(listCommunicationsSchema).query(async ({ ctx, input }) => {
    const { clientId, type, limit } = input;

    // Verify client exists
    const client = await ctx.prisma.client.findFirst({
      where: { id: clientId, tenantId: ctx.tenantId },
    });
    if (!client) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'לקוח לא נמצא' });
    }

    const communications = await ctx.prisma.communicationLog.findMany({
      where: { tenantId: ctx.tenantId, clientId, ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get user details
    const userIds = Array.from(new Set(communications.map((c: { userId: string }) => c.userId)));
    const users = await ctx.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, avatar: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return communications.map((comm: { userId: string }) => ({
      ...comm,
      user: userMap.get(comm.userId) || null,
    }));
  }),

  // Create communication log entry
  create: tenantProcedure.input(createCommunicationSchema).mutation(async ({ ctx, input }) => {
    // Verify client exists
    const client = await ctx.prisma.client.findFirst({
      where: { id: input.clientId, tenantId: ctx.tenantId },
    });
    if (!client) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'לקוח לא נמצא' });
    }

    return ctx.prisma.communicationLog.create({
      data: {
        tenantId: ctx.tenantId,
        userId: ctx.auth.user.id,
        clientId: input.clientId,
        type: input.type,
        direction: input.direction,
        subject: input.subject,
        content: input.content,
      },
    });
  }),
});
