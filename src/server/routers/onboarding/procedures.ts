import { TRPCError } from '@trpc/server';
import type { PrismaClient } from '@prisma/client';
import {
  companyProfileSchema, brandingSchema, pricingSchema, teamInvitesSchema,
  projectPhasesSchema, dataImportSchema, integrationsSchema,
} from './schemas';
import {
  getOrCreateOnboardingState, updateOnboardingStep, generateSlug, findUniqueSlug,
} from './helpers';
import type { z } from 'zod';

type CompanyInput = z.infer<typeof companyProfileSchema>;
type BrandingInput = z.infer<typeof brandingSchema>;
type PricingInput = z.infer<typeof pricingSchema>;
type PhasesInput = z.infer<typeof projectPhasesSchema>;
type InvitesInput = z.infer<typeof teamInvitesSchema>;
type ImportInput = z.infer<typeof dataImportSchema>;
type IntegrationsInput = z.infer<typeof integrationsSchema>;

export async function getOnboardingState(prisma: PrismaClient, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
  if (!user?.tenantId) return { hasCompletedOnboarding: false, currentStep: 1, completedSteps: [], skippedSteps: [] };
  const state = await getOrCreateOnboardingState(prisma, userId, user.tenantId);
  if (!state) return { hasCompletedOnboarding: false, currentStep: 1, completedSteps: [], skippedSteps: [] };
  return { hasCompletedOnboarding: state.completedAt !== null, currentStep: state.currentStep,
    completedSteps: state.completedSteps, skippedSteps: state.skippedSteps, showOnLogin: state.showOnLogin };
}

export async function setupCompanyProcedure(prisma: PrismaClient, userId: string, input: CompanyInput) {
  const existingUser = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true, email: true } });
  if (!existingUser) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

  // Check if onboarding was already completed
  const existingOnboarding = await prisma.onboardingState.findUnique({ where: { userId } });
  if (existingOnboarding?.completedAt) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Onboarding already completed' });
  }

  const slug = await findUniqueSlug(prisma, generateSlug(input.name));

  // Update the existing tenant (created during signup)
  const tenant = await prisma.tenant.update({
    where: { id: existingUser.tenantId },
    data: {
      name: input.name, slug, phone: input.phone, address: input.address,
      website: input.website, businessType: input.businessType, logo: input.logo,
      feeSettings: { defaultBillingType: 'fixed', defaultMarkupPercent: 30, markupType: 'cost_plus' },
      features: { timeTracking: true, permitTracking: input.businessType !== 'interior_design' },
      limits: { maxUsers: 3, maxProjects: 10, maxStorageGB: 5 },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { role: 'owner', permissions: { canViewFinancials: true, canEditFinancials: true,
      canManageUsers: true, canDeleteRecords: true, canAccessAllProjects: true, canManageSettings: true } },
  });

  // Create or update onboarding state
  await prisma.onboardingState.upsert({
    where: { userId },
    create: { userId, tenantId: tenant.id, currentStep: 2, completedSteps: [1], data: { companyProfile: input } },
    update: { currentStep: 2, completedSteps: [1], data: { companyProfile: input } },
  });
  return { tenantId: tenant.id, slug };
}

export async function setupBrandingProcedure(prisma: PrismaClient, tenantId: string, userId: string, input: BrandingInput) {
  await prisma.tenant.update({ where: { id: tenantId }, data: { primaryColor: input.primaryColor, logo: input.logo } });
  await updateOnboardingStep(prisma, userId, 2, { branding: input });
  return { success: true };
}

export async function setupPricingProcedure(prisma: PrismaClient, tenantId: string, userId: string, input: PricingInput) {
  const feeSettings = { defaultBillingType: input.defaultBillingType, defaultHourlyRate: input.hourlyRate,
    defaultMarkupPercent: input.markupPercent || 30, markupType: 'cost_plus' };
  await prisma.tenant.update({ where: { id: tenantId }, data: { currency: input.currency, vatRate: input.vatRate, feeSettings } });
  await updateOnboardingStep(prisma, userId, 3, { pricing: input });
  return { success: true };
}

export async function setupPhasesProcedure(prisma: PrismaClient, tenantId: string, userId: string, input: PhasesInput) {
  if (!input.useDefault && input.customPhases) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { features: true } });
    const features = (tenant?.features as Record<string, unknown>) || {};
    await prisma.tenant.update({ where: { id: tenantId }, data: { features: { ...features, customPhases: input.customPhases } } });
  }
  await updateOnboardingStep(prisma, userId, 4, { projectPhases: input });
  return { success: true };
}

export async function inviteTeamProcedure(prisma: PrismaClient, tenantId: string, userId: string, input: InvitesInput) {
  const invitations = await Promise.all(input.invites.map(async (invite) => {
    const token = crypto.randomUUID();
    return prisma.teamInvitation.create({
      data: { tenantId, email: invite.email, role: invite.role, invitedByUserId: userId,
        token, status: 'pending', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
  }));
  await updateOnboardingStep(prisma, userId, 5, { teamInvites: input.invites });
  return { invitationsSent: invitations.length };
}

export async function setupImportProcedure(prisma: PrismaClient, userId: string, input: ImportInput) {
  await updateOnboardingStep(prisma, userId, 6, { dataImport: input });
  return { success: true, message: input.importClients || input.importProducts
    ? 'Import settings saved. You can import data from Settings later.' : 'Skipped import.' };
}

export async function setupIntegrationsProcedure(prisma: PrismaClient, tenantId: string, userId: string, input: IntegrationsInput) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { features: true } });
  const features = (tenant?.features as Record<string, unknown>) || {};
  await prisma.tenant.update({ where: { id: tenantId }, data: { features: { ...features, integrations: input } } });
  await updateOnboardingStep(prisma, userId, 7, { integrations: input });
  return { success: true };
}
