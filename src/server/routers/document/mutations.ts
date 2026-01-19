import { TRPCError } from '@trpc/server';
import { tenantProcedure } from '../../trpc';
import {
  createDocumentSchema, updateDocumentSchema, deleteDocumentSchema,
  uploadVersionSchema, toggleSharingSchema, bulkDeleteDocumentsSchema, createShareLinkSchema,
} from './schemas';

export const createMutation = tenantProcedure.input(createDocumentSchema).mutation(async ({ ctx, input }) => {
  const { projectId, ...data } = input;
  if (projectId) {
    const project = await ctx.prisma.project.findFirst({ where: { id: projectId, tenantId: ctx.tenantId } });
    if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'פרויקט לא נמצא' });
  }
  return ctx.prisma.document.create({
    data: { ...data, projectId, tenantId: ctx.tenantId, uploadedById: ctx.auth.user.id },
    include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
  });
});

export const updateMutation = tenantProcedure.input(updateDocumentSchema).mutation(async ({ ctx, input }) => {
  const { id, ...data } = input;
  const existing = await ctx.prisma.document.findFirst({ where: { id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מסמך לא נמצא' });
  return ctx.prisma.document.update({ where: { id }, data });
});

export const deleteMutation = tenantProcedure.input(deleteDocumentSchema).mutation(async ({ ctx, input }) => {
  const existing = await ctx.prisma.document.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מסמך לא נמצא' });
  await ctx.prisma.document.deleteMany({ where: { parentId: input.id } });
  return ctx.prisma.document.delete({ where: { id: input.id } });
});

export const uploadVersionMutation = tenantProcedure.input(uploadVersionSchema).mutation(async ({ ctx, input }) => {
  const { parentId, ...data } = input;
  const parent = await ctx.prisma.document.findFirst({ where: { id: parentId, tenantId: ctx.tenantId } });
  if (!parent) throw new TRPCError({ code: 'NOT_FOUND', message: 'מסמך לא נמצא' });

  const originalId = parent.parentId || parent.id;
  const maxVersion = await ctx.prisma.document.aggregate({
    where: { OR: [{ id: originalId }, { parentId: originalId }], tenantId: ctx.tenantId },
    _max: { version: true },
  });

  return ctx.prisma.document.create({
    data: {
      name: parent.name, type: parent.type, categoryId: parent.categoryId, projectId: parent.projectId,
      tenantId: ctx.tenantId, uploadedById: ctx.auth.user.id, parentId: originalId,
      version: (maxVersion._max.version || 0) + 1, ...data,
      isSharedWithClient: parent.isSharedWithClient, clientCanDownload: parent.clientCanDownload,
    },
  });
});

export const toggleSharingMutation = tenantProcedure.input(toggleSharingSchema).mutation(async ({ ctx, input }) => {
  const { id, isSharedWithClient, clientCanDownload } = input;
  const existing = await ctx.prisma.document.findFirst({ where: { id, tenantId: ctx.tenantId } });
  if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'מסמך לא נמצא' });
  return ctx.prisma.document.update({
    where: { id },
    data: { isSharedWithClient, clientCanDownload: clientCanDownload ?? (isSharedWithClient ? existing.clientCanDownload : false) },
  });
});

export const bulkDeleteMutation = tenantProcedure.input(bulkDeleteDocumentsSchema).mutation(async ({ ctx, input }) => {
  await ctx.prisma.document.deleteMany({ where: { parentId: { in: input.ids }, tenantId: ctx.tenantId } });
  const result = await ctx.prisma.document.deleteMany({ where: { id: { in: input.ids }, tenantId: ctx.tenantId } });
  return { count: result.count };
});

export const createShareLinkMutation = tenantProcedure.input(createShareLinkSchema).mutation(async ({ ctx, input }) => {
  const document = await ctx.prisma.document.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!document) throw new TRPCError({ code: 'NOT_FOUND', message: 'מסמך לא נמצא' });
  const expiresAt = input.expiresInDays
    ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = crypto.randomUUID();
  await ctx.prisma.document.update({ where: { id: input.id }, data: { isSharedWithClient: true } });
  return { shareUrl: `/shared/document/${token}`, expiresAt, token };
});
