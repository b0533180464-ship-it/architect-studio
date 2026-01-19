'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { BillingTypeSelect } from './pricing/billing-type-select';
import { PricingInputs } from './pricing/pricing-inputs';

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

type BillingType = 'fixed' | 'hourly' | 'percentage' | 'cost_plus' | 'hybrid';

export function PricingStep({ onNext, onPrevious }: StepProps) {
  const [formData, setFormData] = useState({
    defaultBillingType: 'fixed' as BillingType,
    hourlyRate: 350, markupPercent: 30, currency: 'ILS', vatRate: 17,
  });
  const [error, setError] = useState('');

  const mutation = trpc.onboarding.setupPricing.useMutation({
    onSuccess: () => onNext(),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const updateField = (key: string, value: unknown) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PricingHeader />
      <BillingTypeSelect value={formData.defaultBillingType} onChange={(v) => updateField('defaultBillingType', v)} />
      <PricingInputs formData={formData} updateField={updateField} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <PricingButtons onPrevious={onPrevious} onSkip={onNext} isPending={mutation.isPending} />
    </form>
  );
}

function PricingHeader() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold">תמחור 💰</h2>
      <p className="mt-2 text-muted-foreground">הגדר את שיטת התמחור המועדפת עליך</p>
    </div>
  );
}

interface PricingButtonsProps {
  onPrevious: () => void;
  onSkip: () => void;
  isPending: boolean;
}

function PricingButtons({ onPrevious, onSkip, isPending }: PricingButtonsProps) {
  return (
    <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onPrevious} className="flex-1">חזור</Button>
      <Button type="button" variant="ghost" onClick={onSkip} className="flex-1">דלג</Button>
      <Button type="submit" className="flex-1" disabled={isPending}>
        {isPending ? 'שומר...' : 'המשך'}
      </Button>
    </div>
  );
}
