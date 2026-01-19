'use client';

import { trpc } from '@/lib/trpc';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ConfigSelectCellProps } from '../types';
import type { ConfigEntityType } from '@/components/ui/config-select';

const EMPTY_VALUE = '__none__';

/**
 * תא בחירה מ-ConfigurableEntity
 * טוען אופציות מהשרת לפי entityType
 */
export function ConfigSelectCell({ value, onSave, entityType, placeholder, disabled, allowEmpty }: ConfigSelectCellProps) {
  const { data: options, isLoading } = trpc.config.list.useQuery({ entityType: entityType as ConfigEntityType, activeOnly: true });

  if (isLoading) {
    return <div className="h-8 px-2 flex items-center text-sm text-muted-foreground">...</div>;
  }

  const selectedOption = options?.find((o) => o.id === value);
  const selectValue = value ?? (allowEmpty ? EMPTY_VALUE : '');

  const handleChange = (v: string) => {
    onSave(v === EMPTY_VALUE ? null : v);
  };

  return (
    <Select value={selectValue} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger className={cn('h-8 text-sm border-0 shadow-none hover:bg-muted/50', !value && 'text-muted-foreground')}>
        <SelectValue placeholder={placeholder || 'בחר...'}>
          {selectedOption && <ConfigOptionDisplay option={selectedOption} />}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowEmpty && <SelectItem value={EMPTY_VALUE}>ללא</SelectItem>}
        {options?.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            <ConfigOptionDisplay option={o} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ConfigOptionDisplay({ option }: { option: { name: string; color?: string | null } }) {
  return (
    <span className="flex items-center gap-2">
      {option.color && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: option.color }} />}
      {option.name}
    </span>
  );
}
