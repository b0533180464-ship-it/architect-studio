'use client';

import { Input } from '@/components/ui/input';
import { CellDisplay } from './cell-display';
import { useEditableCell } from './use-editable-cell';
import type { CurrencyCellProps } from '../types';

const parseNumber = (input: string): number | null => {
  const trimmed = input.trim();
  if (trimmed === '') return null;
  const num = parseFloat(trimmed);
  return isNaN(num) ? null : num;
};

const formatCurrency = (value: number | null, currency: string) => {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
};

/**
 * תא מטבע עם עריכה inline
 */
export function CurrencyCell({ value, onSave, placeholder, disabled, currency = 'ILS', min, max }: CurrencyCellProps) {
  const { isEditing, editValue, setEditValue, inputRef, startEditing, saveAndClose, handleKeyDown } = useEditableCell({
    value,
    onSave,
    disabled,
    parseValue: parseNumber,
    formatValue: (v) => v?.toString() ?? '',
  });

  if (isEditing) {
    return <Input ref={inputRef} type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveAndClose} onKeyDown={handleKeyDown} min={min} max={max} className="h-8 text-sm" dir="ltr" />;
  }

  return <CellDisplay value={formatCurrency(value, currency)} placeholder={placeholder} onClick={startEditing} disabled={disabled} dir="ltr" />;
}
