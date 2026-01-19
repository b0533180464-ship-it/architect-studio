import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { tenantProcedure, publicProcedure } from '../../trpc';
import { listProposalsSchema, proposalIdSchema, publicProposalActionSchema } from './schemas';

const proposalInclude = {
  project: { select: { id: true, name: true } },
  client: { select: { id: true, name: true, email: true } },
  items: { orderBy: { order: 'asc' as const } },
};

export const listQuery = tenantProcedure.input(listProposalsSchema).query(async ({ ctx, input }) => {
  const { projectId, clientId, status, search, page, pageSize } = input;
  const skip = (page - 1) * pageSize;
  const where: Prisma.ProposalWhereInput = { tenantId: ctx.tenantId };

  if (projectId) where.projectId = projectId;
  if (clientId) where.clientId = clientId;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { proposalNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [proposals, total] = await Promise.all([
    ctx.prisma.proposal.findMany({
      where, skip, take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    }),
    ctx.prisma.proposal.count({ where }),
  ]);

  const now = new Date();
  const proposalsWithComputed = proposals.map((p) => ({
    ...p,
    computed: {
      isExpired: p.validUntil ? p.validUntil < now : false,
      daysUntilExpiry: p.validUntil ? Math.ceil((p.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null,
      canBeEdited: p.status === 'draft',
      itemCount: p._count.items,
    },
  }));

  return {
    items: proposalsWithComputed,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: page * pageSize < total },
  };
});

export const getByIdQuery = tenantProcedure.input(proposalIdSchema).query(async ({ ctx, input }) => {
  const proposal = await ctx.prisma.proposal.findFirst({
    where: { id: input.id, tenantId: ctx.tenantId },
    include: { ...proposalInclude, versions: { select: { id: true, version: true, createdAt: true, status: true } } },
  });
  if (!proposal) throw new TRPCError({ code: 'NOT_FOUND', message: 'הצעת מחיר לא נמצאה' });

  const now = new Date();
  return {
    ...proposal,
    computed: {
      isExpired: proposal.validUntil ? proposal.validUntil < now : false,
      daysUntilExpiry: proposal.validUntil ? Math.ceil((proposal.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null,
      canBeEdited: proposal.status === 'draft',
      hasNewerVersion: proposal.versions.some((v) => v.version > proposal.version),
    },
  };
});

export const getByTokenQuery = publicProcedure.input(publicProposalActionSchema).query(async ({ ctx, input }) => {
  const proposal = await ctx.prisma.proposal.findFirst({
    where: { publicToken: input.token },
    include: proposalInclude,
  });
  if (!proposal) throw new TRPCError({ code: 'NOT_FOUND', message: 'הצעת מחיר לא נמצאה' });

  // Update view count
  await ctx.prisma.proposal.update({
    where: { id: proposal.id },
    data: { viewCount: { increment: 1 }, viewedAt: proposal.viewedAt ?? new Date(), status: proposal.status === 'sent' ? 'viewed' : proposal.status },
  });

  return proposal;
});

export const getStatsQuery = tenantProcedure.query(async ({ ctx }) => {
  const [total, draft, sent, approved, rejected] = await Promise.all([
    ctx.prisma.proposal.count({ where: { tenantId: ctx.tenantId } }),
    ctx.prisma.proposal.count({ where: { tenantId: ctx.tenantId, status: 'draft' } }),
    ctx.prisma.proposal.count({ where: { tenantId: ctx.tenantId, status: { in: ['sent', 'viewed'] } } }),
    ctx.prisma.proposal.count({ where: { tenantId: ctx.tenantId, status: 'approved' } }),
    ctx.prisma.proposal.count({ where: { tenantId: ctx.tenantId, status: 'rejected' } }),
  ]);

  const totalValue = await ctx.prisma.proposal.aggregate({
    where: { tenantId: ctx.tenantId, status: 'approved' },
    _sum: { total: true },
  });

  return { total, draft, pending: sent, approved, rejected, approvedValue: totalValue._sum.total ?? 0 };
});
