'use client';

interface Step {
  id: number;
  name: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between">
        {steps.map((step) => (
          <StepItem key={step.id} step={step} currentStep={currentStep} />
        ))}
      </div>
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
    </div>
  );
}

function StepItem({ step, currentStep }: { step: Step; currentStep: number }) {
  const isCompleted = step.id < currentStep;
  const isCurrent = step.id === currentStep;

  return (
    <div className={`flex flex-col items-center ${step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
        isCompleted ? 'border-primary bg-primary text-primary-foreground' :
        isCurrent ? 'border-primary bg-background' : 'border-muted bg-background'
      }`}>
        {isCompleted ? '✓' : step.id}
      </div>
      <span className="mt-1 text-xs">{step.name}</span>
    </div>
  );
}

function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  return (
    <div className="relative mt-2">
      <div className="absolute h-1 w-full rounded bg-muted" />
      <div className="absolute h-1 rounded bg-primary transition-all" style={{ width: `${progress}%` }} />
    </div>
  );
}
