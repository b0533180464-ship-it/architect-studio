'use client';

import { Input } from '@/components/ui/input';
import { CellDisplay } from './cell-display';
import { useEditableCell } from './use-editable-cell';
import type { TextCellProps } from '../types';

const parseText = (input: string): string | null => {
  const trimmed = input.trim();
  return trimmed === '' ? null : trimmed;
};

/**
 * תא טקסט עם עריכה inline
 */
export function TextCell({ value, onSave, placeholder, disabled, dir = 'rtl' }: TextCellProps) {
  const { isEditing, editValue, setEditValue, inputRef, startEditing, saveAndClose, handleKeyDown } = useEditableCell({
    value,
    onSave,
    disabled,
    parseValue: parseText,
    formatValue: (v) => v ?? '',
  });

  if (isEditing) {
    return <Input ref={inputRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveAndClose} onKeyDown={handleKeyDown} className="h-8 text-sm" dir={dir} />;
  }

  return <CellDisplay value={value} placeholder={placeholder} onClick={startEditing} disabled={disabled} />;
}
