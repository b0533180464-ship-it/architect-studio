'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface FieldOption {
  value: string;
  label: string;
  color?: string;
}

const EMPTY_VALUE = '__none__';

/**
 * תא בחירה עם dropdown - זהה לקומפוננטה העובדת בטבלה הישנה
 */
export function SelectCell({
  value,
  onSave,
  options,
  placeholder,
  disabled,
}: {
  value: unknown;
  onSave: (value: unknown) => void;
  options: FieldOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const stringValue = value as string | null;
  const selectedOption = options.find((o) => o.value === stringValue);
  const selectValue = stringValue ?? EMPTY_VALUE;

  const handleChange = (v: string) => {
    onSave(v === EMPTY_VALUE ? null : v);
  };

  return (
    <Select value={selectValue} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger className={cn('h-8 text-sm border-0 shadow-none hover:bg-muted/50', !stringValue && 'text-muted-foreground')}>
        <SelectValue placeholder={placeholder || 'בחר...'}>
          {selectedOption && <OptionDisplay option={selectedOption} />}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={EMPTY_VALUE}>ללא</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            <OptionDisplay option={o} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function OptionDisplay({ option }: { option: { label: string; color?: string } }) {
  return (
    <span className="flex items-center gap-2">
      {option.color && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: option.color }} />}
      {option.label}
    </span>
  );
}

/**
 * תא בחירה מרובה
 */
export function MultiSelectCell({
  value,
  onSave,
  options,
  placeholder,
  disabled,
}: {
  value: unknown;
  onSave: (value: unknown) => void;
  options: FieldOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedValues: string[] = Array.isArray(value) ? value : [];
  const selectedOptions = options.filter((o) => selectedValues.includes(o.value));

  const toggleValue = (v: string) => {
    const newValues = selectedValues.includes(v)
      ? selectedValues.filter((x) => x !== v)
      : [...selectedValues, v];
    onSave(newValues.length > 0 ? newValues : null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'w-full min-h-[32px] px-2 py-1 text-sm text-right rounded flex items-center gap-1 flex-wrap',
            'hover:bg-muted/50 focus:outline-none',
            disabled && 'opacity-50 cursor-not-allowed',
            selectedOptions.length === 0 && 'text-muted-foreground'
          )}
        >
          {selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted"
                style={{ backgroundColor: opt.color ? `${opt.color}20` : undefined }}
              >
                {opt.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />}
                {opt.label}
              </span>
            ))
          ) : (
            <span>{placeholder || 'בחר...'}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start">
        {options.map((o) => {
          const isSelected = selectedValues.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggleValue(o.value)}
              className={cn(
                'w-full px-2 py-1.5 text-sm text-right rounded hover:bg-accent flex items-center gap-2',
                isSelected && 'bg-accent'
              )}
            >
              <span className={cn('w-4 h-4 border rounded flex items-center justify-center text-xs', isSelected && 'bg-primary text-primary-foreground')}>
                {isSelected && '✓'}
              </span>
              {o.color && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: o.color }} />}
              <span className="truncate">{o.label}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

/**
 * תא טקסט ארוך עם popover
 */
export function TextareaCell({
  value,
  onSave,
  placeholder,
  disabled,
}: {
  value: string | null;
  onSave: (value: unknown) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState(value || '');

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed !== (value || '')) {
      onSave(trimmed || null);
    }
    setIsOpen(false);
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (open) setEditValue(value || '');
        else handleSave();
        setIsOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <div className={cn('min-h-[32px] px-1 py-1 rounded flex items-center', !disabled && 'cursor-pointer hover:bg-muted/50')}>
          {value ? (
            <span className="truncate text-sm">{value}</span>
          ) : (
            <span className="text-muted-foreground text-sm">{placeholder || '—'}</span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder={placeholder} className="min-h-[100px]" autoFocus />
      </PopoverContent>
    </Popover>
  );
}

// Re-export user cell components
export { UserCell, UsersCell } from './user-cell-components';
