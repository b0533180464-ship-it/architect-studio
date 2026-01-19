'use client';

import { trpc } from '@/lib/trpc';

export function useOnboardingState() {
  const { data, isLoading } = trpc.onboarding.getState.useQuery();

  return {
    isLoading,
    hasCompletedOnboarding: data?.hasCompletedOnboarding ?? false,
    currentStep: data?.currentStep ?? 0,
    completedSteps: data?.completedSteps ?? [],
  };
}
