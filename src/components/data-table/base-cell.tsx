'use client';

import { cn } from '@/lib/utils';

interface BaseCellWrapperProps {
  children: React.ReactNode;
  onClick?: () => void;
  isEditing?: boolean;
  sticky?: boolean;
  width?: number | string;
  className?: string;
}

/**
 * Wrapper בסיסי לתאים בטבלה
 * מספק styling אחיד ותמיכה ב-sticky columns
 */
export function BaseCellWrapper({
  children,
  onClick,
  isEditing,
  sticky,
  width,
  className,
}: BaseCellWrapperProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    minWidth: typeof width === 'number' ? `${width}px` : width,
  };

  return (
    <td
      onClick={onClick}
      style={style}
      className={cn(
        'py-2 px-2 border-l border-border/50',
        'transition-colors duration-100',
        !isEditing && onClick && 'cursor-pointer hover:bg-muted/50',
        sticky && 'sticky right-0 z-10 bg-background shadow-[-2px_0_5px_rgba(0,0,0,0.05)]',
        className
      )}
    >
      {children}
    </td>
  );
}

/**
 * תצוגת ערך ריק
 */
export function EmptyValue({ placeholder }: { placeholder?: string }) {
  return (
    <span className="text-muted-foreground text-sm">
      {placeholder || '-'}
    </span>
  );
}

/**
 * Wrapper לערך שניתן ללחיצה
 */
export function ClickableValue({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'min-h-[32px] px-1 py-1 rounded',
        'flex items-center',
        onClick && 'cursor-pointer hover:bg-muted/50',
        className
      )}
    >
      {children}
    </div>
  );
}
