'use client';

import { useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { CheckboxCellProps } from '../types';

/**
 * תא checkbox עם שמירה מיידית
 * לחיצה = toggle + שמירה אוטומטית
 */
export function CheckboxCell({ value, onSave, disabled }: CheckboxCellProps) {
  const handleChange = useCallback((checked: boolean | 'indeterminate') => {
    if (checked !== 'indeterminate') {
      onSave(checked);
    }
  }, [onSave]);

  return (
    <div className={cn('min-h-[32px] px-1 py-1 flex items-center justify-center', disabled && 'opacity-50')}>
      <Checkbox checked={value} onCheckedChange={handleChange} disabled={disabled} />
    </div>
  );
}
