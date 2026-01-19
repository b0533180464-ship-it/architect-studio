import { z } from 'zod';

export const teamInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['manager', 'member']),
  projectIds: z.array(z.string()).optional(),
  customPermissions: z.object({
    canViewFinancials: z.boolean().optional(),
    canEditFinancials: z.boolean().optional(),
    canManageUsers: z.boolean().optional(),
    canDeleteRecords: z.boolean().optional(),
    canAccessAllProjects: z.boolean().optional(),
    canManageSettings: z.boolean().optional(),
  }).optional(),
});

export const cancelInviteSchema = z.object({
  invitationId: z.string(),
});

export const resendInviteSchema = z.object({
  invitationId: z.string(),
});

export const deleteMemberSchema = z.object({
  userId: z.string(),
  transferProjectsTo: z.string().optional(), // Transfer projects to another user
});

export const invitationIdSchema = z.object({
  id: z.string(),
});
