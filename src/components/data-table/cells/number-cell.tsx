'use client';

import { Input } from '@/components/ui/input';
import { CellDisplay } from './cell-display';
import { useEditableCell } from './use-editable-cell';
import type { NumberCellProps } from '../types';

const parseNumber = (input: string): number | null => {
  const trimmed = input.trim();
  if (trimmed === '') return null;
  const num = parseFloat(trimmed);
  return isNaN(num) ? null : num;
};

/**
 * תא מספר עם עריכה inline
 */
export function NumberCell({ value, onSave, placeholder, disabled, step = 1, min, max }: NumberCellProps) {
  const { isEditing, editValue, setEditValue, inputRef, startEditing, saveAndClose, handleKeyDown } = useEditableCell({
    value,
    onSave,
    disabled,
    parseValue: parseNumber,
    formatValue: (v) => v?.toString() ?? '',
  });

  if (isEditing) {
    return <Input ref={inputRef} type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveAndClose} onKeyDown={handleKeyDown} step={step} min={min} max={max} className="h-8 text-sm" dir="ltr" />;
  }

  const display = value !== null && value !== undefined ? value.toLocaleString('he-IL') : null;
  return <CellDisplay value={display} placeholder={placeholder} onClick={startEditing} disabled={disabled} dir="ltr" />;
}
