'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingState } from './use-onboarding-state';
import { OnboardingSteps } from './onboarding-steps';
import type { Route } from 'next';

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoading, hasCompletedOnboarding } = useOnboardingState();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    );
  }

  if (hasCompletedOnboarding) {
    router.push('/dashboard' as Route);
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <OnboardingSteps />
    </div>
  );
}
