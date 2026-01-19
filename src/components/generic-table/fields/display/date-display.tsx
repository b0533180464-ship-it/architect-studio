'use client';

import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { FieldDisplayProps } from '../types';

type DateDisplayType = 'date' | 'datetime';

interface DateFieldDisplayProps extends FieldDisplayProps {
  type: DateDisplayType;
}

export function DateFieldDisplay({ type, value, className }: DateFieldDisplayProps) {
  if (value === null || value === undefined || value === '') {
    return <span className={cn('text-muted-foreground', className)}>—</span>;
  }

  const formatStr = type === 'datetime' ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
  const Icon = type === 'datetime' ? Clock : Calendar;

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
      <span>{format(new Date(value as string), formatStr, { locale: he })}</span>
    </span>
  );
}
