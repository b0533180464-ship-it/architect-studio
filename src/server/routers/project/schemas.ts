import { z } from 'zod';

// Enums
export const priorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);
export const billingTypeEnum = z.enum(['fixed', 'hourly', 'percentage', 'cost_plus', 'hybrid']);
export const permitStatusEnum = z.enum([
  'not_required', 'preparing', 'submitted', 'in_review', 'approved', 'rejected', 'appealed',
]);

// Create project input
export const createProjectSchema = z.object({
  // Basic info
  name: z.string().min(1, 'שם הפרויקט הוא שדה חובה').max(200),
  description: z.string().optional(),
  code: z.string().max(20).optional(),

  // Relations
  clientId: z.string().cuid('יש לבחור לקוח'),
  assignedUserIds: z.array(z.string().cuid()).optional(),

  // Classification
  typeId: z.string().cuid().optional(),
  statusId: z.string().cuid().optional(),
  phaseId: z.string().cuid().optional(),
  priority: priorityEnum.default('medium'),
  isVIP: z.boolean().default(false),
  tags: z.array(z.string()).optional(),

  // Location
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  area: z.number().positive().optional(),
  floors: z.number().int().positive().optional(),

  // Budget & Pricing
  budget: z.number().nonnegative().optional(),
  currency: z.string().length(3).default('ILS'),
  billingType: billingTypeEnum.default('fixed'),
  fixedFee: z.number().nonnegative().optional(),
  hourlyRate: z.number().nonnegative().optional(),
  estimatedHours: z.number().int().nonnegative().optional(),
  percentageOfBudget: z.number().min(0).max(100).optional(),
  markupPercent: z.number().min(0).max(100).optional(),

  // Scope
  scope: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  revisionsIncluded: z.number().int().nonnegative().default(2),

  // Permit
  requiresPermit: z.boolean().default(false),
  permitStatus: permitStatusEnum.optional(),
  permitNumber: z.string().max(50).optional(),
  permitNotes: z.string().optional(),

  // Dates
  startDate: z.string().optional(),
  expectedEndDate: z.string().optional(),
  constructionStartDate: z.string().optional(),
  constructionEndDate: z.string().optional(),
  installationDate: z.string().optional(),

  // Source
  referralSource: z.string().max(100).optional(),
  referredByClientId: z.string().cuid().optional(),
});

// Update project input
export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string().cuid(),
});

// List projects input
export const listProjectsSchema = z.object({
  // Pagination
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),

  // Filters
  clientId: z.string().cuid().optional(),
  statusId: z.string().cuid().optional(),
  phaseId: z.string().cuid().optional(),
  priority: priorityEnum.optional(),
  isVIP: z.boolean().optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  assignedUserId: z.string().cuid().optional(),

  // Sorting
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'startDate', 'expectedEndDate', 'budget']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Include archived
  includeArchived: z.boolean().default(false),
});

// Get project by ID
export const getProjectByIdSchema = z.object({
  id: z.string().cuid(),
});

// Delete project
export const deleteProjectSchema = z.object({
  id: z.string().cuid(),
});

// Archive/restore project
export const archiveProjectSchema = z.object({
  id: z.string().cuid(),
});

// Assign users to project
export const assignUsersSchema = z.object({
  projectId: z.string().cuid(),
  userIds: z.array(z.string().cuid()),
  replace: z.boolean().default(false), // If true, replace all; if false, add to existing
});

// Update permit
export const updatePermitSchema = z.object({
  id: z.string().cuid(),
  permitStatus: permitStatusEnum,
  permitNumber: z.string().max(50).optional(),
  permitNotes: z.string().optional(),
  permitSubmittedAt: z.string().optional(),
  permitApprovedAt: z.string().optional(),
});

// Get project activity
export const getActivitySchema = z.object({
  projectId: z.string().cuid(),
  limit: z.number().int().min(1).max(100).default(50),
});

// Get project timeline
export const getTimelineSchema = z.object({
  projectId: z.string().cuid(),
});

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsInput = z.infer<typeof listProjectsSchema>;
