'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { CellDisplay } from './cell-display';
import type { DateCellProps } from '../types';

const toDateString = (value: Date | string | null): string => {
  if (!value) return '';
  const str = typeof value === 'string' ? value : value.toISOString();
  return str.split('T')[0] ?? '';
};

/**
 * תא תאריך עם עריכה inline
 */
export function DateCell({ value, onSave, placeholder, disabled }: DateCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dateValue = toDateString(value);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.showPicker?.();
    }
  }, [isEditing]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value || null;
    if (newValue !== dateValue) onSave(newValue);
    setIsEditing(false);
  }, [dateValue, onSave]);

  if (isEditing) {
    return <Input ref={inputRef} type="date" defaultValue={dateValue} onChange={handleChange} onBlur={() => setIsEditing(false)} onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)} className="h-8 text-sm" />;
  }

  const display = value ? new Date(value).toLocaleDateString('he-IL') : null;
  return <CellDisplay value={display} placeholder={placeholder} onClick={() => !disabled && setIsEditing(true)} disabled={disabled} />;
}
