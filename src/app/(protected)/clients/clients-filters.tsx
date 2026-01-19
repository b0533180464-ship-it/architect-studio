/* eslint-disable max-lines-per-function */
'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Filters {
  status?: 'lead' | 'active' | 'past' | 'inactive';
  type?: 'individual' | 'company';
  city?: string;
}

interface ClientsFiltersProps {
  filters: Filters;
  cities: string[];
  onFilterChange: (filters: Filters) => void;
}

export function ClientsFilters({ filters, cities, onFilterChange }: ClientsFiltersProps) {
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={filters.status || 'all'}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            status: value === 'all' ? undefined : (value as Filters['status']),
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="סטטוס" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסטטוסים</SelectItem>
          <SelectItem value="lead">ליד</SelectItem>
          <SelectItem value="active">פעיל</SelectItem>
          <SelectItem value="past">לקוח עבר</SelectItem>
          <SelectItem value="inactive">לא פעיל</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.type || 'all'}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            type: value === 'all' ? undefined : (value as Filters['type']),
          })
        }
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="סוג" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסוגים</SelectItem>
          <SelectItem value="individual">פרטי</SelectItem>
          <SelectItem value="company">חברה</SelectItem>
        </SelectContent>
      </Select>

      {cities.length > 0 && (
        <Select
          value={filters.city || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              city: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="עיר" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הערים</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onFilterChange({})}>
          נקה פילטרים
        </Button>
      )}
    </div>
  );
}
