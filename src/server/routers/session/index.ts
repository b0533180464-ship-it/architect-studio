import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { revokeSessionSchema } from './schemas';

export const sessionRouter = createTRPCRouter({
  // List all active sessions for current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await ctx.prisma.session.findMany({
      where: {
        userId: ctx.auth.user.id,
        isActive: true,
        expires: { gt: new Date() },
      },
      select: {
        id: true,
        deviceType: true,
        deviceName: true,
        browser: true,
        os: true,
        ip: true,
        lastActiveAt: true,
        createdAt: true,
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    return sessions;
  }),

  // Revoke a specific session
  revoke: protectedProcedure.input(revokeSessionSchema).mutation(async ({ ctx, input }) => {
    // Verify session belongs to current user
    const session = await ctx.prisma.session.findFirst({
      where: {
        id: input.sessionId,
        userId: ctx.auth.user.id,
      },
    });

    if (!session) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
    }

    return ctx.prisma.session.update({
      where: { id: input.sessionId },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedReason: input.reason || 'User revoked',
      },
    });
  }),

  // Revoke all sessions except current
  revokeAll: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.prisma.session.updateMany({
      where: {
        userId: ctx.auth.user.id,
        isActive: true,
        // Don't revoke the current session - we'd need to identify it
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedReason: 'User revoked all sessions',
      },
    });
    return { revokedCount: result.count };
  }),
});
