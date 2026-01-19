'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { ColorPicker } from './branding/color-picker';
import { BrandingPreview } from './branding/branding-preview';

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function BrandingStep({ onNext, onPrevious }: StepProps) {
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [error, setError] = useState('');

  const mutation = trpc.onboarding.setupBranding.useMutation({
    onSuccess: () => onNext(),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate({ primaryColor });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BrandingHeader />
      <ColorPicker value={primaryColor} onChange={setPrimaryColor} />
      <BrandingPreview primaryColor={primaryColor} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <StepButtons onPrevious={onPrevious} onSkip={onNext} isPending={mutation.isPending} />
    </form>
  );
}

function BrandingHeader() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold">מיתוג 🎨</h2>
      <p className="mt-2 text-muted-foreground">בחר צבע ראשי למשרד שלך</p>
    </div>
  );
}

interface StepButtonsProps {
  onPrevious: () => void;
  onSkip: () => void;
  isPending: boolean;
}

function StepButtons({ onPrevious, onSkip, isPending }: StepButtonsProps) {
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
