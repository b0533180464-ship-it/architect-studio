'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Mail, Phone, Link2, Calendar, Clock } from 'lucide-react';
import { SelectCell, MultiSelectCell, TextareaCell, UserCell, UsersCell, type FieldOption } from './cell-components';
import { getValidator } from './fields/validation';
import type { CustomFieldType } from '@/server/routers/customFields/schemas';

export type { FieldOption } from './cell-components';

interface EditableCellProps {
  type: CustomFieldType;
  value: unknown;
  onSave: (value: unknown) => void;
  options?: FieldOption[];
  placeholder?: string;
  disabled?: boolean;
}

/**
 * תא עריכה - לחיצה פותחת עריכה, Enter/Blur שומר, Escape מבטל
 */
export function EditableCell({
  type, value, onSave, options = [], placeholder, disabled,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');
  const [error, setError] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const formatForInput = useCallback((val: unknown): string => {
    if (val === null || val === undefined) return '';
    if ((type === 'date' || type === 'datetime') && val) {
      try {
        const d = new Date(val as string);
        return type === 'datetime' ? d.toISOString().slice(0, 16) : d.toISOString().slice(0, 10);
      } catch { return ''; }
    }
    return String(val);
  }, [type]);

  const startEditing = useCallback(() => {
    if (disabled || type === 'select' || type === 'multiselect' || type === 'boolean' || type === 'user' || type === 'users') return;
    setEditValue(formatForInput(value));
    setError(undefined);
    setIsEditing(true);
  }, [disabled, type, value, formatForInput]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current) inputRef.current.select();
    }
  }, [isEditing]);

  const validateAndSave = useCallback((): boolean => {
    // Get validator for this field type
    const validator = getValidator(type);
    const result = validator(editValue);

    if (!result.isValid) {
      setError(result.error);
      return false;
    }

    setError(undefined);
    setIsEditing(false);

    // Parse value based on type
    let parsed: unknown = editValue.trim() || null;
    if (type === 'number' || type === 'currency') {
      parsed = editValue ? parseFloat(editValue) : null;
    } else if (type === 'date' || type === 'datetime') {
      parsed = editValue ? new Date(editValue).toISOString() : null;
    }

    if (parsed !== value) onSave(parsed);
    return true;
  }, [editValue, value, onSave, type]);

  const cancelEditing = useCallback(() => {
    setEditValue(formatForInput(value));
    setError(undefined);
    setIsEditing(false);
  }, [value, formatForInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      validateAndSave();
    }
    if (e.key === 'Escape') cancelEditing();
  }, [validateAndSave, cancelEditing, type]);

  const handleBlur = useCallback(() => {
    validateAndSave();
  }, [validateAndSave]);

  const handleChange = useCallback((val: string) => {
    setEditValue(val);
    // Clear error while typing
    if (error) setError(undefined);
  }, [error]);

  const getDir = () => {
    if (['email', 'url', 'phone', 'number', 'currency'].includes(type)) return 'ltr';
    return undefined;
  };

  // Select type
  if (type === 'select') {
    return <SelectCell value={value} onSave={onSave} options={options} placeholder={placeholder} disabled={disabled} />;
  }

  // Multiselect type
  if (type === 'multiselect') {
    return <MultiSelectCell value={value} onSave={onSave} options={options} placeholder={placeholder} disabled={disabled} />;
  }

  // Boolean type
  if (type === 'boolean') {
    return (
      <div className="min-h-[32px] px-1 py-1 flex items-center cursor-pointer hover:bg-muted/50 rounded" onClick={() => !disabled && onSave(!value)}>
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onSave(e.target.checked)} disabled={disabled} className="h-4 w-4" />
      </div>
    );
  }

  // Textarea
  if (type === 'textarea') {
    return <TextareaCell value={value as string | null} onSave={onSave} placeholder={placeholder} disabled={disabled} />;
  }

  // User
  if (type === 'user') {
    return <UserCell value={value} onSave={onSave} placeholder={placeholder} disabled={disabled} />;
  }

  // Users (multiple)
  if (type === 'users') {
    return <UsersCell value={value} onSave={onSave} placeholder={placeholder} disabled={disabled} />;
  }

  // Editing mode
  if (isEditing) {
    const inputType = type === 'email' ? 'email' : type === 'url' ? 'url' : type === 'phone' ? 'tel' : type === 'date' ? 'date' : type === 'datetime' ? 'datetime-local' : type === 'number' || type === 'currency' ? 'number' : 'text';
    return (
      <div className="relative">
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={inputType}
          value={editValue}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn('h-8 text-sm', error && 'border-destructive focus-visible:ring-destructive')}
          dir={getDir()}
        />
        {error && (
          <div className="absolute top-full right-0 mt-1 px-2 py-1 text-xs text-destructive bg-destructive/10 rounded z-50 whitespace-nowrap">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Display mode
  return <CellDisplay value={value} type={type} options={options} placeholder={placeholder} onClick={startEditing} disabled={disabled} />;
}

function CellDisplay({ value, type, options, placeholder, onClick, disabled }: {
  value: unknown; type: CustomFieldType; options?: FieldOption[]; placeholder?: string; onClick?: () => void; disabled?: boolean;
}) {
  const hasValue = value !== null && value !== undefined && value !== '';
  let displayValue: React.ReactNode = null;

  if (hasValue) {
    switch (type) {
      case 'date':
        try {
          displayValue = (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              {format(new Date(value as string), 'dd/MM/yyyy', { locale: he })}
            </span>
          );
        } catch { displayValue = String(value); }
        break;
      case 'datetime':
        try {
          displayValue = (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {format(new Date(value as string), 'dd/MM/yyyy HH:mm', { locale: he })}
            </span>
          );
        } catch { displayValue = String(value); }
        break;
      case 'currency':
        displayValue = (
          <span dir="ltr" className="inline-flex items-center gap-0.5">
            <span className="text-muted-foreground">₪</span>
            {(value as number).toLocaleString('he-IL')}
          </span>
        );
        break;
      case 'email':
        displayValue = (
          <span dir="ltr" className="inline-flex items-center gap-1 text-primary">
            <Mail className="h-3 w-3" />
            {String(value)}
          </span>
        );
        break;
      case 'phone':
        displayValue = (
          <span dir="ltr" className="inline-flex items-center gap-1 text-primary">
            <Phone className="h-3 w-3" />
            {String(value)}
          </span>
        );
        break;
      case 'url':
        displayValue = (
          <span dir="ltr" className="inline-flex items-center gap-1 text-primary">
            <Link2 className="h-3 w-3" />
            {String(value)}
          </span>
        );
        break;
      case 'select': {
        const opt = options?.find((o) => o.value === value);
        displayValue = opt ? <span className="flex items-center gap-2">{opt.color && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />}{opt.label}</span> : String(value);
        break;
      }
      default:
        displayValue = String(value);
    }
  }

  return (
    <div onClick={disabled ? undefined : onClick} className={cn('min-h-[32px] px-1 py-1 rounded flex items-center', !disabled && onClick && 'cursor-pointer hover:bg-muted/50', disabled && 'cursor-default')}>
      {hasValue ? <span className="truncate">{displayValue}</span> : <span className="text-muted-foreground text-sm">{placeholder || '—'}</span>}
    </div>
  );
}
