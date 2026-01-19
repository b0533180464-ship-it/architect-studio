'use client';

import { cn } from '@/lib/utils';

interface CellDisplayProps {
  value: React.ReactNode;
  placeholder?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  dir?: 'rtl' | 'ltr';
}

/**
 * תצוגת ערך בתא - משותף לכל סוגי התאים
 */
export function CellDisplay({ value, placeholder, onClick, disabled, className, dir }: CellDisplayProps) {
  const hasValue = value !== null && value !== undefined && value !== '';
  return (
    <div onClick={disabled ? undefined : onClick} dir={dir} className={cn('min-h-[32px] px-1 py-1 rounded flex items-center', !disabled && onClick && 'cursor-pointer hover:bg-muted/50', disabled && 'cursor-default', className)}>
      {hasValue ? <span className="truncate">{value}</span> : <span className="text-muted-foreground text-sm">{placeholder || '-'}</span>}
    </div>
  );
}
