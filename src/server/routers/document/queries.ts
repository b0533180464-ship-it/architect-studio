import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { tenantProcedure } from '../../trpc';
import { listDocumentsSchema, getDocumentByIdSchema, getDocumentUrlSchema } from './schemas';
import { formatFileSize, getFileExtension } from './helpers';

export const listQuery = tenantProcedure.input(listDocumentsSchema).query(async ({ ctx, input }) => {
  const { projectId, categoryId, search, isSharedWithClient, page, pageSize } = input;
  const skip = (page - 1) * pageSize;

  const where: Prisma.DocumentWhereInput = { tenantId: ctx.tenantId, parentId: null };
  if (projectId) where.projectId = projectId;
  if (categoryId) where.categoryId = categoryId;
  if (isSharedWithClient !== undefined) where.isSharedWithClient = isSharedWithClient;
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { type: { contains: search, mode: 'insensitive' } }];

  const [documents, total, categories] = await Promise.all([
    ctx.prisma.document.findMany({
      where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
      include: { project: { select: { id: true, name: true } }, uploadedBy: { select: { id: true, firstName: true, lastName: true } }, _count: { select: { versions: true } } },
    }),
    ctx.prisma.document.count({ where }),
    ctx.prisma.configurableEntity.findMany({ where: { tenantId: ctx.tenantId, entityType: 'document_category' } }),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const items = documents.map((doc) => ({
    ...doc, documentCategory: doc.categoryId ? categoryMap.get(doc.categoryId) : null,
    computed: { fileSizeFormatted: formatFileSize(doc.fileSize), fileExtension: getFileExtension(doc.name), isImage: doc.mimeType.startsWith('image/'), isPDF: doc.mimeType === 'application/pdf', hasVersions: doc._count.versions > 0, uploaderName: `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}`, categoryName: doc.categoryId ? categoryMap.get(doc.categoryId)?.name : null },
  }));

  return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: page * pageSize < total } };
});

export const getByIdQuery = tenantProcedure.input(getDocumentByIdSchema).query(async ({ ctx, input }) => {
  const [document, categories] = await Promise.all([
    ctx.prisma.document.findFirst({
      where: { id: input.id, tenantId: ctx.tenantId },
      include: { project: { select: { id: true, name: true } }, uploadedBy: { select: { id: true, firstName: true, lastName: true } }, versions: { orderBy: { version: 'desc' }, select: { id: true, version: true, fileUrl: true, fileSize: true, createdAt: true, uploadedBy: { select: { firstName: true, lastName: true } } } } },
    }),
    ctx.prisma.configurableEntity.findMany({ where: { tenantId: ctx.tenantId, entityType: 'document_category' } }),
  ]);

  if (!document) throw new TRPCError({ code: 'NOT_FOUND', message: 'מסמך לא נמצא' });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  return {
    ...document, documentCategory: document.categoryId ? categoryMap.get(document.categoryId) : null,
    computed: { fileSizeFormatted: formatFileSize(document.fileSize), fileExtension: getFileExtension(document.name), isImage: document.mimeType.startsWith('image/'), isPDF: document.mimeType === 'application/pdf', hasVersions: document.versions.length > 0, latestVersion: document.version, uploaderName: `${document.uploadedBy.firstName} ${document.uploadedBy.lastName}`, categoryName: document.categoryId ? categoryMap.get(document.categoryId)?.name : null },
  };
});

export const getVersionsQuery = tenantProcedure.input(getDocumentByIdSchema).query(async ({ ctx, input }) => {
  const document = await ctx.prisma.document.findFirst({ where: { id: input.id, tenantId: ctx.tenantId } });
  if (!document) throw new TRPCError({ code: 'NOT_FOUND', message: 'מסמך לא נמצא' });

  const parentId = document.parentId || document.id;
  const versions = await ctx.prisma.document.findMany({
    where: { OR: [{ id: parentId }, { parentId }], tenantId: ctx.tenantId },
    orderBy: { version: 'desc' },
    select: { id: true, version: true, fileUrl: true, fileSize: true, createdAt: true, uploadedBy: { select: { firstName: true, lastName: true } } },
  });

  return versions.map((v) => ({ ...v, fileSizeFormatted: formatFileSize(v.fileSize), uploaderName: `${v.uploadedBy.firstName} ${v.uploadedBy.lastName}` }));
});

export const getStatsQuery = tenantProcedure.query(async ({ ctx }) => {
  const [total, shared, byMimeType] = await Promise.all([
    ctx.prisma.document.count({ where: { tenantId: ctx.tenantId, parentId: null } }),
    ctx.prisma.document.count({ where: { tenantId: ctx.tenantId, parentId: null, isSharedWithClient: true } }),
    ctx.prisma.document.groupBy({ by: ['mimeType'], where: { tenantId: ctx.tenantId, parentId: null }, _count: true }),
  ]);

  const categories = { images: 0, pdfs: 0, documents: 0, other: 0 };
  for (const item of byMimeType) {
    if (item.mimeType.startsWith('image/')) categories.images += item._count;
    else if (item.mimeType === 'application/pdf') categories.pdfs += item._count;
    else if (item.mimeType.includes('document') || item.mimeType.includes('word') || item.mimeType.includes('excel')) categories.documents += item._count;
    else categories.other += item._count;
  }

  return { total, shared, categories };
});

export const getDownloadUrlQuery = tenantProcedure.input(getDocumentUrlSchema).query(async ({ ctx, input }) => {
  const document = await ctx.prisma.document.findFirst({ where: { id: input.id, tenantId: ctx.tenantId }, select: { fileUrl: true, name: true } });
  if (!document) throw new TRPCError({ code: 'NOT_FOUND', message: 'מסמך לא נמצא' });
  return { url: document.fileUrl, filename: document.name };
});

export const getPreviewUrlQuery = tenantProcedure.input(getDocumentUrlSchema).query(async ({ ctx, input }) => {
  const document = await ctx.prisma.document.findFirst({ where: { id: input.id, tenantId: ctx.tenantId }, select: { fileUrl: true, mimeType: true, name: true } });
  if (!document) throw new TRPCError({ code: 'NOT_FOUND', message: 'מסמך לא נמצא' });
  const isPreviewable = document.mimeType.startsWith('image/') || document.mimeType === 'application/pdf' || document.mimeType.startsWith('video/');
  return { url: document.fileUrl, mimeType: document.mimeType, name: document.name, isPreviewable };
});

export const getThumbnailQuery = tenantProcedure.input(getDocumentUrlSchema).query(async ({ ctx, input }) => {
  const document = await ctx.prisma.document.findFirst({ where: { id: input.id, tenantId: ctx.tenantId }, select: { fileUrl: true, mimeType: true } });
  if (!document) throw new TRPCError({ code: 'NOT_FOUND', message: 'מסמך לא נמצא' });
  if (document.mimeType.startsWith('image/')) return { url: document.fileUrl, type: 'image' };
  if (document.mimeType === 'application/pdf') return { url: null, type: 'pdf' };
  if (document.mimeType.startsWith('video/')) return { url: null, type: 'video' };
  return { url: null, type: 'other' };
});
