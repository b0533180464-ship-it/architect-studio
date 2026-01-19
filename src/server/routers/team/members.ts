import { TRPCError } from '@trpc/server';
import { tenantProcedure } from '../../trpc';
import { deleteMemberSchema } from './schemas';

export const membersProcedures = {
  // Delete team member (permanent removal)
  deleteMember: tenantProcedure.input(deleteMemberSchema).mutation(async ({ ctx, input }) => {
    if (ctx.userRole !== 'owner') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only owners can delete team members' });
    }

    if (input.userId === ctx.auth.user.id) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot delete yourself' });
    }

    const userToDelete = await ctx.prisma.user.findFirst({
      where: { id: input.userId, tenantId: ctx.tenantId },
      include: {
        createdProjects: { select: { id: true } },
        assignedProjects: { select: { id: true } },
      },
    });

    if (!userToDelete) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    if (userToDelete.role === 'owner') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete other owners' });
    }

    // Handle project transfer if specified
    if (input.transferProjectsTo && userToDelete.createdProjects.length > 0) {
      const targetUser = await ctx.prisma.user.findFirst({
        where: { id: input.transferProjectsTo, tenantId: ctx.tenantId },
      });

      if (!targetUser) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Target user for project transfer not found' });
      }

      await ctx.prisma.project.updateMany({
        where: { createdById: input.userId },
        data: { createdById: input.transferProjectsTo },
      });
    }

    // Remove user from assigned projects
    const projectIds = userToDelete.assignedProjects.map((p) => p.id);
    for (const projectId of projectIds) {
      await ctx.prisma.project.update({
        where: { id: projectId },
        data: { assignedUsers: { disconnect: { id: input.userId } } },
      });
    }

    // Delete user sessions
    await ctx.prisma.session.deleteMany({
      where: { userId: input.userId },
    });

    // Delete the user
    await ctx.prisma.user.delete({
      where: { id: input.userId },
    });

    return { success: true };
  }),
};
