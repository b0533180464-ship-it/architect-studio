'use client';

import { cn } from '@/lib/utils';
import type { ColumnDef } from './types';

interface ColumnHeaderProps<T> {
  column: ColumnDef<T>;
}

/**
 * כותרת עמודה בטבלה
 */
export function ColumnHeader<T>({ column }: ColumnHeaderProps<T>) {
  const style: React.CSSProperties = {
    width: typeof column.width === 'number' ? `${column.width}px` : column.width,
    minWidth: column.minWidth ? `${column.minWidth}px` : undefined,
  };

  return (
    <th
      style={style}
      className={cn(
        'py-3 px-2 text-right text-sm font-medium text-muted-foreground',
        'border-l border-border/50 bg-muted/30',
        column.sticky && 'sticky right-0 z-20 bg-muted/50 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]'
      )}
    >
      <div className="flex items-center gap-1">
        <span>{column.label}</span>
        {column.required && <span className="text-destructive">*</span>}
      </div>
    </th>
  );
}

/**
 * שורת כותרות
 */
export function TableHeader<T>({ columns }: { columns: ColumnDef<T>[] }) {
  return (
    <thead className="sticky top-0 z-10">
      <tr>
        {columns.map((column) => (
          <ColumnHeader key={column.key} column={column} />
        ))}
        {/* עמודת פעולות */}
        <th className="py-3 px-2 w-10 bg-muted/30 border-l border-border/50" />
      </tr>
    </thead>
  );
}
