import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import { createContractSchema, updateContractSchema, listContractsSchema, contractIdSchema, signContractSchema, createFromProposalSchema } from './schemas';

async function generateContractNumber(prisma: typeof import('@prisma/client').PrismaClient.prototype, tenantId: string) {
  const year = new Date().getFullYear();
  const prefix = 'CON';
  const last = await prisma.contract.findFirst({
    where: { tenantId, contractNumber: { startsWith: `${prefix}-${year}-` } },
    orderBy: { contractNumber: 'desc' },
  });
  const parts = last?.contractNumber?.split('-') ?? [];
  const nextNum = parts.length >= 3 ? parseInt(parts[2] ?? '0') + 1 : 1;
  return `${prefix}-${year}-${String(nextNum).padStart(3, '0')}`;
}

export const contractRouter = createTRPCRouter({
  list: tenantProcedure.input(listContractsSchema).query(async ({ ctx, input }) => {
    const { projectId, clientId, status, search, page, pageSize } = input;
    const skip = (page - 1) * pageSize;
    const where: Prisma.ContractWhereInput = { tenantId: ctx.tenantId };

    if (projectId) where.projectId = projectId;
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { contractNumber: { contains: search, mode: 'insensitive' } }];

    const [contracts, total] = await Promise.all([
      ctx.prisma.contract.findMany({
        where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
        include: { project: { select: { id: true, name: true } }, client: { select: { id: true, name: true } } },
      }),
      ctx.prisma.contract.count({ where }),
    ]);

    const now = new Date();
    const contractsWithComputed = contracts.map((c) => {
      const signatures = c.signatures as { party: string; signedAt?: string }[] || [];
      return {
        ...c,
        computed: {
          designerSigned: signatures.some((s) => s.party === 'designer' && s.signedAt),
          clientSigned: signatures.some((s) => s.party === 'client' && s.signedAt),
          allSigned: c.status === 'signed',
          isActive: c.status === 'signed' && c.startDate <= now && (!c.endDate || c.endDate >= now),
          daysRemaining: c.endDate ? Math.ceil((c.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null,
        },
      };
    });

    return { items: contractsWithComputed, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: page * pageSize < total } };
  }),

  getById: tenantProcedure.input(contractIdSchema).query(async ({ ctx, input }) => {
    const contract = await ctx.prisma.contract.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
      include: { project: { select: { id: true, name: true } }, client: { select: { id: true, name: true, email: true } }, proposal: { select: { id: true, proposalNumber: true } } },
    });
    if (!contract) throw new TRPCError({ code: 'NOT_FOUND', message: 'חוזה לא נמצא' });
    return contract;
  }),

  create: tenantProcedure.input(createContractSchema).mutation(async ({ ctx, input }) => {
    const contractNumber = await generateContractNumber(ctx.prisma, ctx.tenantId);
    return ctx.prisma.contract.create({
      data: {
        tenantId: ctx.tenantId, contractNumber, title: input.title, content: input.content, projectId: input.projectId, clientId: input.clientId,
        templateId: input.templateId, proposalId: input.proposalId, totalValue: input.totalValue, currency: 'ILS',
        startDate: new Date(input.startDate), endDate: input.endDate ? new Date(input.endDate) : null, createdById: ctx.auth.user.id,
      },
    });
  }),

  update: tenantProcedure.input(updateContractSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    const existing = await ctx.prisma.contract.findFirst({ where: { id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'חוזה לא נמצא' });
    if (existing.status !== 'draft') throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן לערוך רק חוזים בסטטוס טיוטה' });

    return ctx.prisma.contract.update({
      where: { id },
      data: { ...data, startDate: data.startDate ? new Date(data.startDate) : undefined, endDate: data.endDate ? new Date(data.endDate) : undefined },
    });
  }),

  delete: tenantProcedure.input(contractIdSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.contract.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'חוזה לא נמצא' });
    if (existing.status !== 'draft') throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן למחוק רק חוזים בסטטוס טיוטה' });
    return ctx.prisma.contract.delete({ where: { id: input.id } });
  }),

  sendForSignature: tenantProcedure.input(contractIdSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.contract.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'חוזה לא נמצא' });
    // TODO: Send email notification
    return ctx.prisma.contract.update({ where: { id: input.id }, data: { status: 'sent' } });
  }),

  sign: tenantProcedure.input(signContractSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.contract.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'חוזה לא נמצא' });

    const signatures = existing.signatures as { id: string; party: string; signedAt?: string }[] || [];
    const newSignature = { id: nanoid(), party: input.party, name: input.name, email: input.email, title: input.title, signedAt: new Date().toISOString(), signatureUrl: input.signatureUrl };
    const updatedSignatures = [...signatures.filter((s) => s.party !== input.party), newSignature];

    const designerSigned = updatedSignatures.some((s) => s.party === 'designer' && s.signedAt);
    const clientSigned = updatedSignatures.some((s) => s.party === 'client' && s.signedAt);
    const newStatus = designerSigned && clientSigned ? 'signed' : designerSigned || clientSigned ? 'partially_signed' : 'pending_signature';

    return ctx.prisma.contract.update({ where: { id: input.id }, data: { signatures: updatedSignatures, status: newStatus } });
  }),

  createFromProposal: tenantProcedure.input(createFromProposalSchema).mutation(async ({ ctx, input }) => {
    const proposal = await ctx.prisma.proposal.findFirst({
      where: { id: input.proposalId, tenantId: ctx.tenantId },
      include: { project: true, client: true },
    });
    if (!proposal) throw new TRPCError({ code: 'NOT_FOUND', message: 'הצעת מחיר לא נמצאה' });
    if (!proposal.projectId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'הצעת המחיר חייבת להיות מקושרת לפרויקט' });

    const contractNumber = await generateContractNumber(ctx.prisma, ctx.tenantId);
    return ctx.prisma.contract.create({
      data: {
        tenantId: ctx.tenantId, contractNumber, title: `חוזה - ${proposal.title}`,
        content: input.content ?? `חוזה שנוצר מהצעת מחיר ${proposal.proposalNumber}`,
        projectId: proposal.projectId, clientId: proposal.clientId, proposalId: proposal.id,
        totalValue: proposal.total, currency: proposal.currency,
        startDate: new Date(input.startDate), endDate: input.endDate ? new Date(input.endDate) : null,
        templateId: input.templateId, createdById: ctx.auth.user.id,
      },
    });
  }),

  getStats: tenantProcedure.query(async ({ ctx }) => {
    const [total, draft, pending, signed, totalValue] = await Promise.all([
      ctx.prisma.contract.count({ where: { tenantId: ctx.tenantId } }),
      ctx.prisma.contract.count({ where: { tenantId: ctx.tenantId, status: 'draft' } }),
      ctx.prisma.contract.count({ where: { tenantId: ctx.tenantId, status: { in: ['sent', 'pending_signature', 'partially_signed'] } } }),
      ctx.prisma.contract.count({ where: { tenantId: ctx.tenantId, status: 'signed' } }),
      ctx.prisma.contract.aggregate({ where: { tenantId: ctx.tenantId, status: 'signed' }, _sum: { totalValue: true } }),
    ]);
    return { total, draft, pending, signed, signedValue: totalValue._sum.totalValue ?? 0 };
  }),
});
