'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type TeamSize = '1' | '2-5' | '6-10' | '11-20' | '20+';

const SIZES: TeamSize[] = ['1', '2-5', '6-10', '11-20', '20+'];

interface Props {
  value: TeamSize;
  onChange: (value: TeamSize) => void;
}

export function TeamSizeSelect({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label>גודל הצוות</Label>
      <div className="grid grid-cols-5 gap-2">
        {SIZES.map((size) => (
          <Button
            key={size}
            type="button"
            variant={value === size ? 'default' : 'outline'}
            onClick={() => onChange(size)}
            size="sm"
          >
            {size}
          </Button>
        ))}
      </div>
    </div>
  );
}
