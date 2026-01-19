'use client';

import { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { validateEmail, validatePhone, validateUrl } from './validation';
import type { FieldInputProps } from './types';

type TextType = 'text' | 'email' | 'phone' | 'url' | 'textarea';

interface TextFieldInputProps extends FieldInputProps {
  type: TextType;
}

export function TextFieldInput({
  type,
  value,
  onChange,
  onCancel,
  placeholder,
  disabled,
  autoFocus = true,
  className,
}: TextFieldInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | undefined>();
  const [localValue, setLocalValue] = useState((value as string) || '');

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  // Sync local value with prop
  useEffect(() => {
    setLocalValue((value as string) || '');
  }, [value]);

  const validate = (val: string): boolean => {
    let result = { isValid: true, error: undefined as string | undefined };

    switch (type) {
      case 'email': {
        const r = validateEmail(val);
        result = { isValid: r.isValid, error: r.error };
        break;
      }
      case 'phone': {
        const r = validatePhone(val);
        result = { isValid: r.isValid, error: r.error };
        break;
      }
      case 'url': {
        const r = validateUrl(val);
        result = { isValid: r.isValid, error: r.error };
        break;
      }
    }

    setError(result.error);
    return result.isValid;
  };

  const handleChange = (val: string) => {
    setLocalValue(val);
    // Clear error while typing
    if (error) setError(undefined);
  };

  const handleBlur = () => {
    if (validate(localValue)) {
      onChange(localValue || null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setLocalValue((value as string) || '');
      setError(undefined);
      onCancel?.();
    }
    if (e.key === 'Enter' && type !== 'textarea') {
      if (validate(localValue)) {
        onChange(localValue || null);
      }
    }
  };

  // Textarea has its own component
  if (type === 'textarea') {
    return (
      <Textarea
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn('min-h-[80px]', className)}
      />
    );
  }

  // Map type to HTML input type
  const inputType = type === 'email' ? 'email' : type === 'url' ? 'url' : type === 'phone' ? 'tel' : 'text';
  const isLtr = type === 'url' || type === 'email';

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type={inputType}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        dir={isLtr ? 'ltr' : undefined}
        className={cn('h-8', error && 'border-destructive', className)}
      />
      {error && (
        <span className="absolute top-full right-0 mt-1 text-xs text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
