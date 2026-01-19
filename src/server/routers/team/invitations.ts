import { TRPCError } from '@trpc/server';
import { tenantProcedure } from '../../trpc';
import { teamInviteSchema, cancelInviteSchema, resendInviteSchema, invitationIdSchema } from './schemas';

export const invitationsProcedures = {
  // List pending invitations
  listInvitations: tenantProcedure.query(async ({ ctx }) => {
    return ctx.prisma.teamInvitation.findMany({
      where: { tenantId: ctx.tenantId, status: 'pending' },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        invitedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // Send team invitation
  // eslint-disable-next-line complexity
  invite: tenantProcedure.input(teamInviteSchema).mutation(async ({ ctx, input }) => {
    if (ctx.userRole !== 'owner' && ctx.userRole !== 'manager') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only owners and managers can invite team members' });
    }

    if (ctx.userRole === 'manager' && input.role !== 'member') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Managers can only invite members, not other managers' });
    }

    const existingUser = await ctx.prisma.user.findFirst({
      where: { tenantId: ctx.tenantId, email: input.email },
    });

    if (existingUser) {
      throw new TRPCError({ code: 'CONFLICT', message: 'User with this email already exists in your organization' });
    }

    const existingInvitation = await ctx.prisma.teamInvitation.findFirst({
      where: { tenantId: ctx.tenantId, email: input.email, status: 'pending' },
    });

    if (existingInvitation) {
      throw new TRPCError({ code: 'CONFLICT', message: 'An invitation for this email is already pending' });
    }

    const tenant = await ctx.prisma.tenant.findUnique({
      where: { id: ctx.tenantId },
      select: { limits: true },
    });

    const limits = (tenant?.limits as { maxUsers?: number }) || {};
    const currentUserCount = await ctx.prisma.user.count({
      where: { tenantId: ctx.tenantId, isActive: true },
    });

    if (limits.maxUsers && currentUserCount >= limits.maxUsers) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You have reached the maximum number of users (${limits.maxUsers}) for your plan`,
      });
    }

    const token = crypto.randomUUID();
    const invitation = await ctx.prisma.teamInvitation.create({
      data: {
        tenantId: ctx.tenantId,
        email: input.email,
        role: input.role,
        customPermissions: input.customPermissions,
        projectIds: input.projectIds || [],
        invitedByUserId: ctx.auth.user.id,
        token,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { id: invitation.id, email: invitation.email, inviteUrl: `/invite/accept?token=${token}` };
  }),

  // Cancel pending invitation
  cancelInvitation: tenantProcedure.input(cancelInviteSchema).mutation(async ({ ctx, input }) => {
    if (ctx.userRole !== 'owner' && ctx.userRole !== 'manager') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only owners and managers can cancel invitations' });
    }

    const invitation = await ctx.prisma.teamInvitation.findFirst({
      where: { id: input.invitationId, tenantId: ctx.tenantId },
    });

    if (!invitation) throw new TRPCError({ code: 'NOT_FOUND', message: 'Invitation not found' });
    if (invitation.status !== 'pending') {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only cancel pending invitations' });
    }

    return ctx.prisma.teamInvitation.update({
      where: { id: input.invitationId },
      data: { status: 'cancelled' },
    });
  }),

  // Resend invitation
  resendInvitation: tenantProcedure.input(resendInviteSchema).mutation(async ({ ctx, input }) => {
    if (ctx.userRole !== 'owner' && ctx.userRole !== 'manager') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only owners and managers can resend invitations' });
    }

    const invitation = await ctx.prisma.teamInvitation.findFirst({
      where: { id: input.invitationId, tenantId: ctx.tenantId },
    });

    if (!invitation) throw new TRPCError({ code: 'NOT_FOUND', message: 'Invitation not found' });
    if (invitation.status !== 'pending') {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only resend pending invitations' });
    }

    const token = crypto.randomUUID();
    await ctx.prisma.teamInvitation.update({
      where: { id: input.invitationId },
      data: { token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    return { success: true, inviteUrl: `/invite/accept?token=${token}` };
  }),

  // Get invitation by ID
  getInvitation: tenantProcedure.input(invitationIdSchema).query(async ({ ctx, input }) => {
    const invitation = await ctx.prisma.teamInvitation.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
      include: { invitedBy: { select: { firstName: true, lastName: true } } },
    });

    if (!invitation) throw new TRPCError({ code: 'NOT_FOUND', message: 'Invitation not found' });
    return invitation;
  }),
};
