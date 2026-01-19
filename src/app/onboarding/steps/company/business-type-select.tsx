'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type BusinessType = 'interior_design' | 'architecture' | 'both';

const OPTIONS: { value: BusinessType; label: string }[] = [
  { value: 'interior_design', label: 'עיצוב פנים' },
  { value: 'architecture', label: 'אדריכלות' },
  { value: 'both', label: 'שניהם' },
];

interface Props {
  value: BusinessType;
  onChange: (value: BusinessType) => void;
}

export function BusinessTypeSelect({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label>סוג עסק *</Label>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? 'default' : 'outline'}
            onClick={() => onChange(option.value)}
            className="w-full"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
