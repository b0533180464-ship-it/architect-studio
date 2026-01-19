'use client';

import { cn } from '@/lib/utils';
import type { FieldDisplayProps } from '../types';

type NumberDisplayType = 'number' | 'currency';

interface NumberFieldDisplayProps extends FieldDisplayProps {
  type: NumberDisplayType;
}

export function NumberFieldDisplay({ type, value, className }: NumberFieldDisplayProps) {
  if (value === null || value === undefined || value === '') {
    return <span className={cn('text-muted-foreground', className)}>—</span>;
  }

  const numValue = typeof value === 'number' ? value : parseFloat(String(value));

  if (type === 'currency') {
    return (
      <span dir="ltr" className={cn('inline-flex items-center gap-0.5', className)}>
        <span className="text-muted-foreground">₪</span>
        <span>{numValue.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
      </span>
    );
  }

  return (
    <span dir="ltr" className={className}>
      {numValue.toLocaleString('he-IL')}
    </span>
  );
}
