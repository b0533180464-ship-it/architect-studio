import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, tenantProcedure } from '../../trpc';
import {
  tenantUpdateSchema, feeSettingsSchema, featuresSchema, createTenantSchema,
} from './schemas';

export const tenantRouter = createTRPCRouter({
  getCurrent: tenantProcedure.query(async ({ ctx }) => {
    const tenant = await ctx.prisma.tenant.findUnique({
      where: { id: ctx.tenantId },
    });
    if (!tenant) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Tenant not found' });
    }
    return tenant;
  }),

  update: tenantProcedure.input(tenantUpdateSchema).mutation(async ({ ctx, input }) => {
    if (ctx.userRole !== 'owner' && ctx.userRole !== 'manager') {
      throw new TRPCError({
        code: 'FORBIDDEN', message: 'Only owners and managers can update tenant settings',
      });
    }
    return ctx.prisma.tenant.update({ where: { id: ctx.tenantId }, data: input });
  }),

  updateFeeSettings: tenantProcedure.input(feeSettingsSchema).mutation(async ({ ctx, input }) => {
    if (ctx.userRole !== 'owner' && ctx.userRole !== 'manager') {
      throw new TRPCError({
        code: 'FORBIDDEN', message: 'Only owners and managers can update fee settings',
      });
    }
    const tenant = await ctx.prisma.tenant.findUnique({
      where: { id: ctx.tenantId }, select: { feeSettings: true },
    });
    const currentSettings = (tenant?.feeSettings as object) || {};
    return ctx.prisma.tenant.update({
      where: { id: ctx.tenantId }, data: { feeSettings: { ...currentSettings, ...input } },
    });
  }),

  updateFeatures: tenantProcedure.input(featuresSchema).mutation(async ({ ctx, input }) => {
    if (ctx.userRole !== 'owner') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only owners can update tenant features' });
    }
    const tenant = await ctx.prisma.tenant.findUnique({
      where: { id: ctx.tenantId }, select: { features: true },
    });
    const currentFeatures = (tenant?.features as object) || {};
    return ctx.prisma.tenant.update({
      where: { id: ctx.tenantId }, data: { features: { ...currentFeatures, ...input } },
    });
  }),

  getStats: tenantProcedure.query(async ({ ctx }) => {
    const [users, clients, projects] = await Promise.all([
      ctx.prisma.user.count({ where: { tenantId: ctx.tenantId, isActive: true } }),
      ctx.prisma.client.count({ where: { tenantId: ctx.tenantId, isActive: true } }),
      ctx.prisma.project.count({ where: { tenantId: ctx.tenantId, archivedAt: null } }),
    ]);
    return { users, clients, projects };
  }),

  create: protectedProcedure.input(createTenantSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.auth.user.id;
    const existing = await ctx.prisma.tenant.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new TRPCError({ code: 'CONFLICT', message: 'This slug is already taken' });
    }
    const tenant = await ctx.prisma.tenant.create({
      data: {
        ...input,
        feeSettings: {
          defaultBillingType: 'fixed', defaultMarkupPercent: 30, markupType: 'cost_plus',
          disbursementPercent: 0, defaultRetainerPercent: 30,
        },
        features: {
          timeTracking: true, permitTracking: input.businessType !== 'interior_design',
          clientPortal: false, advancedReporting: false, multipleLocations: false,
          customFields: false, apiAccess: false,
        },
        limits: { maxUsers: 3, maxProjects: 10, maxStorageGB: 5, maxClientsPortal: 0 },
      },
    });
    await ctx.prisma.user.update({
      where: { id: userId },
      data: {
        tenantId: tenant.id, role: 'owner',
        permissions: {
          canViewFinancials: true, canEditFinancials: true, canManageUsers: true,
          canDeleteRecords: true, canAccessAllProjects: true, canManageSettings: true,
        },
      },
    });
    return tenant;
  }),
});
