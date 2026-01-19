'use client';

import { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { validateNumber, validateCurrency } from './validation';
import type { FieldInputProps } from './types';

type NumberType = 'number' | 'currency';

interface NumberFieldInputProps extends FieldInputProps {
  type: NumberType;
}

export function NumberFieldInput({
  type,
  value,
  onChange,
  onCancel,
  placeholder,
  disabled,
  autoFocus = true,
  className,
}: NumberFieldInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | undefined>();
  const [localValue, setLocalValue] = useState(
    value !== null && value !== undefined ? String(value) : ''
  );

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(value !== null && value !== undefined ? String(value) : '');
  }, [value]);

  const validate = (val: string): boolean => {
    const result = type === 'currency' ? validateCurrency(val) : validateNumber(val);
    setError(result.error);
    return result.isValid;
  };

  const handleChange = (val: string) => {
    setLocalValue(val);
    if (error) setError(undefined);
  };

  const handleBlur = () => {
    if (validate(localValue)) {
      onChange(localValue ? parseFloat(localValue) : null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setLocalValue(value !== null && value !== undefined ? String(value) : '');
      setError(undefined);
      onCancel?.();
    }
    if (e.key === 'Enter') {
      if (validate(localValue)) {
        onChange(localValue ? parseFloat(localValue) : null);
      }
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="number"
        step={type === 'currency' ? '0.01' : '1'}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        dir="ltr"
        className={cn('h-8 text-left', error && 'border-destructive', className)}
      />
      {error && (
        <span className="absolute top-full right-0 mt-1 text-xs text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
