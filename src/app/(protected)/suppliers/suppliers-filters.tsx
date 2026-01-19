/* eslint-disable max-lines-per-function */
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface FiltersState {
  categoryId?: string;
  city?: string;
  hasTradeAccount?: boolean;
}

interface SuppliersFiltersProps {
  filters: FiltersState;
  cities: string[];
  categories: Category[];
  onFilterChange: (filters: FiltersState) => void;
}

export function SuppliersFilters({ filters, cities, categories, onFilterChange }: SuppliersFiltersProps) {
  const hasFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category Filter */}
      <Select
        value={filters.categoryId || 'all'}
        onValueChange={(v) => onFilterChange({ ...filters, categoryId: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="קטגוריה" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הקטגוריות</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              <span className="flex items-center gap-2">
                {cat.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />}
                {cat.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* City Filter */}
      <Select
        value={filters.city || 'all'}
        onValueChange={(v) => onFilterChange({ ...filters, city: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="עיר" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הערים</SelectItem>
          {cities.map((city) => (
            <SelectItem key={city} value={city}>{city}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Trade Account Filter */}
      <Select
        value={filters.hasTradeAccount === undefined ? 'all' : filters.hasTradeAccount ? 'yes' : 'no'}
        onValueChange={(v) => onFilterChange({ ...filters, hasTradeAccount: v === 'all' ? undefined : v === 'yes' })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Trade Account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">הכל</SelectItem>
          <SelectItem value="yes">יש Trade</SelectItem>
          <SelectItem value="no">אין Trade</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onFilterChange({})}>
          נקה פילטרים
        </Button>
      )}
    </div>
  );
}
