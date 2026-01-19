import { TRPCError } from '@trpc/server';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  createProposalItemSchema, updateProposalItemSchema, proposalItemIdSchema,
  listProposalItemsSchema, reorderProposalItemsSchema, toggleSelectionSchema,
} from './schemas';

async function recalculateProposalTotals(prisma: typeof import('@prisma/client').PrismaClient.prototype, proposalId: string) {
  const items = await prisma.proposalItem.findMany({ where: { proposalId, isSelected: true } });
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  const proposal = await prisma.proposal.findUnique({ where: { id: proposalId } });
  if (!proposal) return;

  const discount = proposal.discountAmount ?? 0;
  const afterDiscount = subtotal - discount;
  const vatAmount = afterDiscount * (proposal.vatRate / 100);
  const total = afterDiscount + vatAmount;

  await prisma.proposal.update({
    where: { id: proposalId },
    data: { subtotal, vatAmount, total },
  });
}

export const proposalItemRouter = createTRPCRouter({
  list: tenantProcedure.input(listProposalItemsSchema).query(async ({ ctx, input }) => {
    const proposal = await ctx.prisma.proposal.findFirst({ where: { id: input.proposalId, tenantId: ctx.tenantId } });
    if (!proposal) throw new TRPCError({ code: 'NOT_FOUND', message: 'הצעת מחיר לא נמצאה' });

    return ctx.prisma.proposalItem.findMany({
      where: { proposalId: input.proposalId },
      orderBy: { order: 'asc' },
      include: { product: { select: { id: true, name: true, sku: true, imageUrl: true } } },
    });
  }),

  create: tenantProcedure.input(createProposalItemSchema).mutation(async ({ ctx, input }) => {
    const proposal = await ctx.prisma.proposal.findFirst({ where: { id: input.proposalId, tenantId: ctx.tenantId } });
    if (!proposal) throw new TRPCError({ code: 'NOT_FOUND', message: 'הצעת מחיר לא נמצאה' });
    if (proposal.status !== 'draft') throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן להוסיף פריטים רק להצעות בסטטוס טיוטה' });

    const maxOrder = await ctx.prisma.proposalItem.aggregate({ where: { proposalId: input.proposalId }, _max: { order: true } });
    const total = input.quantity * input.unitPrice;

    const item = await ctx.prisma.proposalItem.create({
      data: { ...input, total, order: input.order ?? (maxOrder._max.order ?? 0) + 1 },
    });
    await recalculateProposalTotals(ctx.prisma, input.proposalId);
    return item;
  }),

  update: tenantProcedure.input(updateProposalItemSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    const existing = await ctx.prisma.proposalItem.findFirst({
      where: { id },
      include: { proposal: { select: { tenantId: true, status: true } } },
    });
    if (!existing || existing.proposal.tenantId !== ctx.tenantId) throw new TRPCError({ code: 'NOT_FOUND', message: 'פריט לא נמצא' });
    if (existing.proposal.status !== 'draft') throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן לערוך פריטים רק בהצעות בסטטוס טיוטה' });

    const quantity = data.quantity ?? existing.quantity;
    const unitPrice = data.unitPrice ?? existing.unitPrice;
    const total = quantity * unitPrice;

    const item = await ctx.prisma.proposalItem.update({ where: { id }, data: { ...data, total } });
    await recalculateProposalTotals(ctx.prisma, existing.proposalId);
    return item;
  }),

  delete: tenantProcedure.input(proposalItemIdSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.proposalItem.findFirst({
      where: { id: input.id },
      include: { proposal: { select: { tenantId: true, status: true } } },
    });
    if (!existing || existing.proposal.tenantId !== ctx.tenantId) throw new TRPCError({ code: 'NOT_FOUND', message: 'פריט לא נמצא' });
    if (existing.proposal.status !== 'draft') throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן למחוק פריטים רק מהצעות בסטטוס טיוטה' });

    await ctx.prisma.proposalItem.delete({ where: { id: input.id } });
    await recalculateProposalTotals(ctx.prisma, existing.proposalId);
    return { success: true };
  }),

  reorder: tenantProcedure.input(reorderProposalItemsSchema).mutation(async ({ ctx, input }) => {
    const proposal = await ctx.prisma.proposal.findFirst({ where: { id: input.proposalId, tenantId: ctx.tenantId } });
    if (!proposal) throw new TRPCError({ code: 'NOT_FOUND', message: 'הצעת מחיר לא נמצאה' });

    await Promise.all(input.items.map((item) => ctx.prisma.proposalItem.update({ where: { id: item.id }, data: { order: item.order } })));
    return { success: true };
  }),

  toggleSelection: tenantProcedure.input(toggleSelectionSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.proposalItem.findFirst({
      where: { id: input.id },
      include: { proposal: { select: { tenantId: true } } },
    });
    if (!existing || existing.proposal.tenantId !== ctx.tenantId) throw new TRPCError({ code: 'NOT_FOUND', message: 'פריט לא נמצא' });

    const item = await ctx.prisma.proposalItem.update({ where: { id: input.id }, data: { isSelected: input.isSelected } });
    await recalculateProposalTotals(ctx.prisma, existing.proposalId);
    return item;
  }),
});
