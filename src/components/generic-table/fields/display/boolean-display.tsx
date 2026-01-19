'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FieldDisplayProps } from '../types';

export function BooleanFieldDisplay({ value, className }: FieldDisplayProps) {
  const isChecked = Boolean(value);

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-5 h-5 rounded border',
        isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30',
        className
      )}
    >
      {isChecked ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-muted-foreground/50" />}
    </span>
  );
}
