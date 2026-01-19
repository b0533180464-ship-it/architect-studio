'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { FieldInputProps } from './types';

export function SelectFieldInput({
  value,
  onChange,
  options = [],
  placeholder,
  disabled,
  className,
}: FieldInputProps) {
  return (
    <Select
      value={(value as string) || ''}
      onValueChange={(v) => onChange(v || null)}
      disabled={disabled}
    >
      <SelectTrigger className={cn('h-8', className)}>
        <SelectValue placeholder={placeholder || 'בחר...'} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <div className="flex items-center gap-2">
              {opt.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
              )}
              <span>{opt.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
