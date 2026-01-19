import type { PrismaClient, Prisma } from '@prisma/client';

export async function getOrCreateOnboardingState(
  prisma: PrismaClient,
  userId: string,
  tenantId: string | null
) {
  const existing = await prisma.onboardingState.findUnique({
    where: { userId },
  });

  if (existing) return existing;

  // Only create if user has a tenant
  if (!tenantId) return null;

  return prisma.onboardingState.create({
    data: {
      userId,
      tenantId,
      currentStep: 1,
      completedSteps: [],
      skippedSteps: [],
      data: {},
    },
  });
}

export async function updateOnboardingStep(
  prisma: PrismaClient,
  userId: string,
  step: number,
  stepData: Record<string, unknown>,
  skip = false
) {
  const state = await prisma.onboardingState.findUnique({
    where: { userId },
  });

  if (!state) return null;

  // Use Array.from to avoid Set iteration issues
  const completedSteps = skip
    ? state.completedSteps
    : Array.from(new Set([...state.completedSteps, step]));

  const skippedSteps = skip
    ? Array.from(new Set([...state.skippedSteps, step]))
    : state.skippedSteps;

  const currentData = (state.data as Record<string, unknown>) || {};
  const newData = { ...currentData, ...stepData } as Prisma.InputJsonValue;

  return prisma.onboardingState.update({
    where: { userId },
    data: {
      currentStep: step + 1,
      completedSteps,
      skippedSteps,
      data: newData,
      completedAt: step >= 7 ? new Date() : undefined,
    },
  });
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function findUniqueSlug(
  prisma: PrismaClient,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
