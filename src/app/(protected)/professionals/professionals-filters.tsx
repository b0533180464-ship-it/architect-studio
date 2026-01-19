/* eslint-disable max-lines-per-function */
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Trade {
  id: string;
  name: string;
  color: string | null;
}

interface FiltersState {
  tradeId?: string;
}

interface ProfessionalsFiltersProps {
  filters: FiltersState;
  trades: Trade[];
  onFilterChange: (filters: FiltersState) => void;
}

export function ProfessionalsFilters({ filters, trades, onFilterChange }: ProfessionalsFiltersProps) {
  const hasFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.tradeId || 'all'}
        onValueChange={(v) => onFilterChange({ ...filters, tradeId: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="מקצוע" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל המקצועות</SelectItem>
          {trades.map((trade) => (
            <SelectItem key={trade.id} value={trade.id}>
              <span className="flex items-center gap-2">
                {trade.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: trade.color }} />}
                {trade.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onFilterChange({})}>
          נקה פילטרים
        </Button>
      )}
    </div>
  );
}
