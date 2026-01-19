'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { SelectCellProps } from '../types';

/**
 * תא בחירה עם dropdown
 * שמירה אוטומטית ב-onChange
 */
const EMPTY_VALUE = '__none__';

export function SelectCell({ value, onSave, options, placeholder, disabled, allowEmpty }: SelectCellProps) {
  const selectedOption = options.find((o) => o.value === value);
  const selectValue = value ?? (allowEmpty ? EMPTY_VALUE : '');

  const handleChange = (v: string) => {
    onSave(v === EMPTY_VALUE ? null : v);
  };

  return (
    <Select value={selectValue} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger className={cn('h-8 text-sm border-0 shadow-none hover:bg-muted/50', !value && 'text-muted-foreground')}>
        <SelectValue placeholder={placeholder || 'בחר...'}>
          {selectedOption && <OptionDisplay option={selectedOption} />}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowEmpty && <SelectItem value={EMPTY_VALUE}>ללא</SelectItem>}
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
