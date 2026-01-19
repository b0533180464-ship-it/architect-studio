import { createTRPCRouter, protectedProcedure, tenantProcedure } from '../../trpc';
import {
  companyProfileSchema, brandingSchema, pricingSchema, teamInvitesSchema,
  projectPhasesSchema, dataImportSchema, integrationsSchema, skipStepSchema,
} from './schemas';
import { updateOnboardingStep } from './helpers';
import {
  getOnboardingState, setupCompanyProcedure, setupBrandingProcedure,
  setupPricingProcedure, setupPhasesProcedure, inviteTeamProcedure,
  setupImportProcedure, setupIntegrationsProcedure,
} from './procedures';

export const onboardingRouter = createTRPCRouter({
  getState: protectedProcedure.query(({ ctx }) => getOnboardingState(ctx.prisma, ctx.auth.user.id)),

  setupCompany: protectedProcedure.input(companyProfileSchema)
    .mutation(({ ctx, input }) => setupCompanyProcedure(ctx.prisma, ctx.auth.user.id, input)),

  setupBranding: tenantProcedure.input(brandingSchema)
    .mutation(({ ctx, input }) => setupBrandingProcedure(ctx.prisma, ctx.tenantId, ctx.auth.user.id, input)),

  setupPricing: tenantProcedure.input(pricingSchema)
    .mutation(({ ctx, input }) => setupPricingProcedure(ctx.prisma, ctx.tenantId, ctx.auth.user.id, input)),

  setupProjectPhases: tenantProcedure.input(projectPhasesSchema)
    .mutation(({ ctx, input }) => setupPhasesProcedure(ctx.prisma, ctx.tenantId, ctx.auth.user.id, input)),

  inviteTeam: tenantProcedure.input(teamInvitesSchema)
    .mutation(({ ctx, input }) => inviteTeamProcedure(ctx.prisma, ctx.tenantId, ctx.auth.user.id, input)),

  setupDataImport: tenantProcedure.input(dataImportSchema)
    .mutation(({ ctx, input }) => setupImportProcedure(ctx.prisma, ctx.auth.user.id, input)),

  setupIntegrations: tenantProcedure.input(integrationsSchema)
    .mutation(({ ctx, input }) => setupIntegrationsProcedure(ctx.prisma, ctx.tenantId, ctx.auth.user.id, input)),

  skipStep: tenantProcedure.input(skipStepSchema)
    .mutation(({ ctx, input }) => updateOnboardingStep(ctx.prisma, ctx.auth.user.id, input.step, {}, true)),

  complete: tenantProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.onboardingState.update({
      where: { userId: ctx.auth.user.id },
      data: { completedAt: new Date(), showOnLogin: false },
    });
    return { success: true, redirectTo: '/dashboard' };
  }),
});
