'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { validateDate } from './validation';
import type { FieldInputProps } from './types';

type DateType = 'date' | 'datetime';

interface DateFieldInputProps extends FieldInputProps {
  type: DateType;
}

export function DateFieldInput({
  type,
  value,
  onChange,
  onCancel,
  disabled,
  className,
}: DateFieldInputProps) {
  const [error, setError] = useState<string | undefined>();
  const showTime = type === 'datetime';

  // Convert ISO string to input format
  const inputValue = value
    ? showTime
      ? (value as string).slice(0, 16) // datetime-local format: YYYY-MM-DDTHH:mm
      : (value as string).slice(0, 10) // date format: YYYY-MM-DD
    : '';

  const handleChange = (val: string) => {
    if (error) setError(undefined);

    if (!val) {
      onChange(null);
      return;
    }

    const result = validateDate(val);
    if (!result.isValid) {
      setError(result.error);
      return;
    }

    onChange(new Date(val).toISOString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setError(undefined);
      onCancel?.();
    }
  };

  return (
    <div className="relative">
      <Input
        type={showTime ? 'datetime-local' : 'date'}
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn('h-8', error && 'border-destructive', className)}
        dir="ltr"
      />
      {error && (
        <span className="absolute top-full right-0 mt-1 text-xs text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
