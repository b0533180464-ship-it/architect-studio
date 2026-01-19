'use client';

import { useState } from 'react';
import { CompanyStep } from './steps/company-step';
import { BrandingStep } from './steps/branding-step';
import { PricingStep } from './steps/pricing-step';
import { ProjectPhasesStep } from './steps/project-phases-step';
import { TeamInvitesStep } from './steps/team-invites-step';
import { DataImportStep } from './steps/data-import-step';
import { IntegrationsStep } from './steps/integrations-step';
import { CompleteStep } from './steps/complete-step';
import { StepIndicator } from './step-indicator';

const STEPS = [
  { id: 1, name: 'פרטי חברה', component: CompanyStep },
  { id: 2, name: 'מיתוג', component: BrandingStep },
  { id: 3, name: 'תמחור', component: PricingStep },
  { id: 4, name: 'שלבי פרויקט', component: ProjectPhasesStep },
  { id: 5, name: 'הזמנת צוות', component: TeamInvitesStep },
  { id: 6, name: 'ייבוא נתונים', component: DataImportStep },
  { id: 7, name: 'אינטגרציות', component: IntegrationsStep },
  { id: 8, name: 'סיום', component: CompleteStep },
];

export function OnboardingSteps() {
  const [currentStep, setCurrentStep] = useState(1);
  const goToNext = () => currentStep < STEPS.length && setCurrentStep(currentStep + 1);
  const goToPrevious = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const step = STEPS[currentStep - 1];
  const CurrentStepComponent = step?.component ?? CompanyStep;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <StepIndicator steps={STEPS} currentStep={currentStep} />
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <CurrentStepComponent
          onNext={goToNext}
          onPrevious={goToPrevious}
          isFirst={currentStep === 1}
          isLast={currentStep === STEPS.length}
        />
      </div>
    </div>
  );
}
