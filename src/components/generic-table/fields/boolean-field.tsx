'use client';

import { Checkbox } from '@/components/ui/checkbox';
import type { FieldInputProps } from './types';

export function BooleanFieldInput({
  value,
  onChange,
  disabled,
}: FieldInputProps) {
  return (
    <div className="flex items-center h-8">
      <Checkbox
        checked={Boolean(value)}
        onCheckedChange={(checked) => onChange(Boolean(checked))}
        disabled={disabled}
      />
    </div>
  );
}
