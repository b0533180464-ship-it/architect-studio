'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface UseEditableCellOptions<T> {
  value: T;
  onSave: (value: T) => void;
  disabled?: boolean;
  parseValue?: (input: string) => T;
  formatValue?: (value: T) => string;
}

/**
 * Hook משותף לתאים עם עריכה inline
 */
export function useEditableCell<T>(opts: UseEditableCellOptions<T>) {
  const { value, onSave, disabled, parseValue, formatValue } = opts;
  const fmt = useCallback((v: T) => formatValue ? formatValue(v) : String(v ?? ''), [formatValue]);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(() => fmt(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isEditing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [isEditing]);

  const startEditing = useCallback(() => { if (!disabled) { setEditValue(fmt(value)); setIsEditing(true); } }, [disabled, value, fmt]);
  const cancelEditing = useCallback(() => { setEditValue(fmt(value)); setIsEditing(false); }, [value, fmt]);
  const saveAndClose = useCallback(() => { setIsEditing(false); if (parseValue) { const p = parseValue(editValue); if (p !== value) onSave(p); } }, [editValue, value, onSave, parseValue]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => { if (e.key === 'Enter') saveAndClose(); if (e.key === 'Escape') cancelEditing(); }, [saveAndClose, cancelEditing]);

  return { isEditing, editValue, setEditValue, inputRef, startEditing, cancelEditing, saveAndClose, handleKeyDown };
}
