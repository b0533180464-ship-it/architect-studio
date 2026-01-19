'use client';

import { Mail, Phone, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FieldDisplayProps } from '../types';

type TextDisplayType = 'text' | 'textarea' | 'email' | 'phone' | 'url';

interface TextFieldDisplayProps extends FieldDisplayProps {
  type: TextDisplayType;
}

export function TextFieldDisplay({ type, value, className }: TextFieldDisplayProps) {
  if (value === null || value === undefined || value === '') {
    return <span className={cn('text-muted-foreground', className)}>—</span>;
  }

  const stringValue = String(value);

  switch (type) {
    case 'url':
      return (
        <a
          href={stringValue.startsWith('http') ? stringValue : `https://${stringValue}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('text-primary hover:underline inline-flex items-center gap-1', className)}
          dir="ltr"
        >
          <Link2 className="h-3 w-3 shrink-0" />
          <span className="truncate">{stringValue}</span>
        </a>
      );

    case 'email':
      return (
        <a
          href={`mailto:${stringValue}`}
          className={cn('text-primary hover:underline inline-flex items-center gap-1', className)}
          dir="ltr"
        >
          <Mail className="h-3 w-3 shrink-0" />
          <span className="truncate">{stringValue}</span>
        </a>
      );

    case 'phone':
      return (
        <a
          href={`tel:${stringValue}`}
          className={cn('text-primary hover:underline inline-flex items-center gap-1', className)}
          dir="ltr"
        >
          <Phone className="h-3 w-3 shrink-0" />
          <span className="truncate">{stringValue}</span>
        </a>
      );

    default:
      return <span className={cn('truncate', className)}>{stringValue}</span>;
  }
}
