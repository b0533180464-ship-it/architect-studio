import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';
import { Prisma } from '@prisma/client';
import { tenantProcedure, publicProcedure } from '../../trpc';
import {
  createProposalSchema, updateProposalSchema, proposalIdSchema,
  sendProposalSchema, publicProposalActionSchema, newVersionSchema, duplicateProposalSchema,
} from './schemas';

async function generateProposalNumber(
  prisma: typeof import('@prisma/client').PrismaClient.prototype,
  tenantId: string,
) {
  const year = new Date().getFullYear();
  const prefix = 'PRO';
  const lastProposal = await prisma.proposal.findFirst({
    where: { tenantId, proposalNumber: { startsWith: `${prefix}-${year}-` } },
    orderBy: { proposalNumber: 'desc' },
  });
  const parts = lastProposal?.proposalNumber?.split('-') ?? [];
  const nextNum = parts.length >= 3 ? parseInt(parts[2] ?? '0') + 1 : 1;
  return `${prefix}-${year}-${String(nextNum).padStart(3, '0')}`;
}

export const createMutation = tenantProcedure.input(createProposalSchema).mutation(async ({ ctx, input }) => {
  const proposalNumber = await generateProposalNumber(ctx.prisma, ctx.tenantId);
  const publicToken = nanoid(32);

  return ctx.prisma.proposal.create({
    data: {
      tenantId: ctx.tenantId, clientId: input.clientId, projectId: input.projectId,
      proposalNumber, title: input.title, introduction: input.introduction, scope: input.scope,
      sections: input.sections ?? [], exclusions: input.exclusions ?? [],
      assumptions: input.assumptions ?? [], terms: input.terms,
      discountAmount: input.discountAmount, discountType: input.discountType,
      discountReason: input.discountReason, vatRate: input.vatRate,
      validUntil: input.validUntil ? new Date(input.validUntil) : null,
      requiresSignature: input.requiresSignature, publicToken, createdById: ctx.auth.user.id,
    },
  });
});

export const updateMutation = tenantProcedure.input(updateProposalSchema).mutation(async ({ ctx, input }) => {
  const { id, ...data } = input;
  const existing = await ctx.prisma.proposal.findFirst({ where: { id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'הצעת מחיר לא נמצאה' });
  if (existing.status !== 'draft') throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן לערוך רק הצעות בסטטוס טיוטה' });

  return ctx.prisma.proposal.update({
    where: { id },
    data: { ...data, validUntil: data.validUntil ? new Date(data.validUntil) : undefined },
  });
});

export const deleteMutation = tenantProcedure.input(proposalIdSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.proposal.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'הצעת מחיר לא נמצאה' });
  if (existing.status !== 'draft') throw new TRPCError({ code: 'BAD_REQUEST', message: 'ניתן למחוק רק הצעות בסטטוס טיוטה' });
  return ctx.prisma.proposal.delete({ where: { id: input.id } });
});

export const sendMutation = tenantProcedure.input(sendProposalSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.proposal.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'הצעת מחיר לא נמצאה' });
  return ctx.prisma.proposal.update({ where: { id: input.id }, data: { status: 'sent', sentAt: new Date() } });
});

export const approveMutation = publicProcedure.input(publicProposalActionSchema).mutation(async ({ ctx, input }) => {
  const proposal = await ctx.prisma.proposal.findFirst({ where: { publicToken: input.token } });
  if (!proposal) throw new TRPCError({ code: 'NOT_FOUND', message: 'הצעת מחיר לא נמצאה' });
  return ctx.prisma.proposal.update({ where: { id: proposal.id }, data: { status: 'approved', approvedAt: new Date() } });
});

export const rejectMutation = publicProcedure.input(publicProposalActionSchema).mutation(async ({ ctx, input }) => {
  const proposal = await ctx.prisma.proposal.findFirst({ where: { publicToken: input.token } });
  if (!proposal) throw new TRPCError({ code: 'NOT_FOUND', message: 'הצעת מחיר לא נמצאה' });
  return ctx.prisma.proposal.update({ where: { id: proposal.id }, data: { status: 'rejected', rejectedAt: new Date(), rejectionReason: input.feedback } });
});

export const newVersionMutation = tenantProcedure.input(newVersionSchema).mutation(async ({ ctx, input }) => {
  const original = await ctx.prisma.proposal.findFirst({ where: { id: input.id, tenantId: ctx.tenantId }, include: { items: true } });
  if (!original) throw new TRPCError({ code: 'NOT_FOUND', message: 'הצעת מחיר לא נמצאה' });

  const proposalNumber = await generateProposalNumber(ctx.prisma, ctx.tenantId);
  const data: Prisma.ProposalCreateInput = {
    tenant: { connect: { id: ctx.tenantId } }, client: { connect: { id: original.clientId } },
    project: original.projectId ? { connect: { id: original.projectId } } : undefined,
    parent: { connect: { id: original.id } }, proposalNumber, title: original.title,
    version: original.version + 1, introduction: original.introduction, scope: original.scope,
    sections: original.sections as Prisma.InputJsonValue, exclusions: original.exclusions as Prisma.InputJsonValue,
    assumptions: original.assumptions as Prisma.InputJsonValue, terms: original.terms,
    subtotal: original.subtotal, discountAmount: original.discountAmount, discountType: original.discountType,
    discountReason: original.discountReason, vatRate: original.vatRate, vatAmount: original.vatAmount,
    total: original.total, currency: original.currency, validUntil: original.validUntil,
    requiresSignature: original.requiresSignature, status: 'draft', publicToken: nanoid(32),
    createdById: ctx.auth.user.id,
    items: { create: original.items.map((item) => ({ type: item.type, name: item.name, description: item.description, quantity: item.quantity, unit: item.unit, unitPrice: item.unitPrice, total: item.total, productId: item.productId, imageUrl: item.imageUrl, isOptional: item.isOptional, isSelected: item.isSelected, groupName: item.groupName, order: item.order })) },
  };

  return ctx.prisma.proposal.create({ data });
});

export const duplicateMutation = tenantProcedure.input(duplicateProposalSchema).mutation(async ({ ctx, input }) => {
  const original = await ctx.prisma.proposal.findFirst({ where: { id: input.id, tenantId: ctx.tenantId }, include: { items: true } });
  if (!original) throw new TRPCError({ code: 'NOT_FOUND', message: 'הצעת מחיר לא נמצאה' });

  const proposalNumber = await generateProposalNumber(ctx.prisma, ctx.tenantId);
  const data: Prisma.ProposalCreateInput = {
    tenant: { connect: { id: ctx.tenantId } }, client: { connect: { id: original.clientId } },
    project: original.projectId ? { connect: { id: original.projectId } } : undefined,
    proposalNumber, title: input.title ?? `${original.title} (עותק)`, version: 1,
    introduction: original.introduction, scope: original.scope,
    sections: original.sections as Prisma.InputJsonValue, exclusions: original.exclusions as Prisma.InputJsonValue,
    assumptions: original.assumptions as Prisma.InputJsonValue, terms: original.terms,
    subtotal: original.subtotal, discountAmount: original.discountAmount, discountType: original.discountType,
    discountReason: original.discountReason, vatRate: original.vatRate, vatAmount: original.vatAmount,
    total: original.total, currency: original.currency,
    requiresSignature: original.requiresSignature, status: 'draft', publicToken: nanoid(32),
    createdById: ctx.auth.user.id,
    items: { create: original.items.map((item) => ({ type: item.type, name: item.name, description: item.description, quantity: item.quantity, unit: item.unit, unitPrice: item.unitPrice, total: item.total, productId: item.productId, imageUrl: item.imageUrl, isOptional: item.isOptional, isSelected: item.isSelected, groupName: item.groupName, order: item.order })) },
  };

  return ctx.prisma.proposal.create({ data });
});
