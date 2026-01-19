import { z } from 'zod';

// Create document input
export const createDocumentSchema = z.object({
  projectId: z.string().cuid().optional(),
  name: z.string().min(1, 'שם המסמך הוא שדה חובה').max(255),
  type: z.string().max(50).optional(),
  categoryId: z.string().cuid().optional(),
  fileUrl: z.string().min(1),
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
  isSharedWithClient: z.boolean().default(false),
  clientCanDownload: z.boolean().default(false),
});

// Update document input
export const updateDocumentSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255).optional(),
  type: z.string().max(50).optional(),
  categoryId: z.string().cuid().nullable().optional(),
  isSharedWithClient: z.boolean().optional(),
  clientCanDownload: z.boolean().optional(),
});

// List documents input
export const listDocumentsSchema = z.object({
  projectId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  search: z.string().optional(),
  isSharedWithClient: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// Get document by ID
export const getDocumentByIdSchema = z.object({
  id: z.string().cuid(),
});

// Delete document
export const deleteDocumentSchema = z.object({
  id: z.string().cuid(),
});

// Upload new version
export const uploadVersionSchema = z.object({
  parentId: z.string().cuid(),
  fileUrl: z.string().min(1),
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
});

// Toggle sharing
export const toggleSharingSchema = z.object({
  id: z.string().cuid(),
  isSharedWithClient: z.boolean(),
  clientCanDownload: z.boolean().optional(),
});

// Get document URL (for thumbnail/preview/download)
export const getDocumentUrlSchema = z.object({
  id: z.string().cuid(),
});

// Bulk delete documents
export const bulkDeleteDocumentsSchema = z.object({
  ids: z.array(z.string().cuid()).min(1).max(50),
});

// Create share link
export const createShareLinkSchema = z.object({
  id: z.string().cuid(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

// Type exports
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type ListDocumentsInput = z.infer<typeof listDocumentsSchema>;
