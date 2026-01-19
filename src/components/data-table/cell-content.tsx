'use client';

import { ClickableValue, EmptyValue } from './base-cell';
import type { ColumnDef } from './types';

interface CellContentProps<T> {
  value: unknown;
  column: ColumnDef<T>;
  isNameColumn?: boolean;
}

/**
 * תוכן תא - יוחלף בתאים ספציפיים בשלב הבא
 */
export function CellContent<T>({
  value,
  column,
  isNameColumn,
}: CellContentProps<T>) {
  if (value === null || value === undefined || value === '') {
    return <EmptyValue placeholder={column.placeholder} />;
  }

  if (column.type === 'checkbox') {
    return <CheckboxDisplay value={!!value} />;
  }

  if (column.type === 'date' && value) {
    return <DateDisplay value={value as string} />;
  }

  if (column.type === 'currency' && typeof value === 'number') {
    return <CurrencyDisplay value={value} />;
  }

  return (
    <ClickableValue className={isNameColumn ? 'font-medium' : ''}>
      {String(value)}
    </ClickableValue>
  );
}

function CheckboxDisplay({ value }: { value: boolean }) {
  return (
    <span className={value ? 'text-green-600' : 'text-muted-foreground'}>
      {value ? '✓' : '-'}
    </span>
  );
}

function DateDisplay({ value }: { value: string }) {
  const date = new Date(value);
  return <span>{date.toLocaleDateString('he-IL')}</span>;
}

function CurrencyDisplay({ value }: { value: number }) {
  const formatted = new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
  return <span>{formatted}</span>;
}
