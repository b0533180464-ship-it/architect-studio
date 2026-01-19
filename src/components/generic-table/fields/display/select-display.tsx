'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FieldDisplayProps } from '../types';

type SelectDisplayType = 'select' | 'multiselect';

interface SelectFieldDisplayProps extends FieldDisplayProps {
  type: SelectDisplayType;
}

export function SelectFieldDisplay({ type, value, options = [], className }: SelectFieldDisplayProps) {
  if (value === null || value === undefined || value === '') {
    return <span className={cn('text-muted-foreground', className)}>—</span>;
  }

  if (type === 'multiselect') {
    const selectedOpts = options.filter((o) => (value as string[]).includes(o.value));
    if (selectedOpts.length === 0) {
      return <span className={cn('text-muted-foreground', className)}>—</span>;
    }
    return (
      <div className={cn('flex flex-wrap gap-1', className)}>
        {selectedOpts.map((opt) => (
          <Badge
            key={opt.value}
            variant="secondary"
            className="text-xs"
            style={opt.color ? { backgroundColor: `${opt.color}20`, color: opt.color, borderColor: opt.color } : undefined}
          >
            {opt.color && <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: opt.color }} />}
            {opt.label}
          </Badge>
        ))}
      </div>
    );
  }

  // Single select
  const opt = options.find((o) => o.value === value);
  if (!opt) return <span className={className}>{String(value)}</span>;

  return (
    <Badge
      variant="secondary"
      className={cn('text-xs', className)}
      style={opt.color ? { backgroundColor: `${opt.color}20`, color: opt.color, borderColor: opt.color } : undefined}
    >
      {opt.color && <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: opt.color }} />}
      {opt.label}
    </Badge>
  );
}
