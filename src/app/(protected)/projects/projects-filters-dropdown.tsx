/* eslint-disable max-lines-per-function */
'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Filters {
  clientId?: string;
  typeId?: string;
  statusId?: string;
  phaseId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  isVIP?: boolean;
  city?: string;
  includeArchived?: boolean;
}

interface MoreFiltersDropdownProps {
  filters: Filters;
  cities: string[];
  onFilterChange: (filters: Filters) => void;
}

export function MoreFiltersDropdown({ filters, cities, onFilterChange }: MoreFiltersDropdownProps) {
  const hasMoreFilters = filters.priority || filters.isVIP !== undefined || filters.city;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          עוד פילטרים
          <ChevronDown className="h-4 w-4 mr-1" />
          {hasMoreFilters && (
            <span className="mr-1 rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">!</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">עדיפות</label>
            <Select
              value={filters.priority || 'all'}
              onValueChange={(v) =>
                onFilterChange({ ...filters, priority: v === 'all' ? undefined : (v as Filters['priority']) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר עדיפות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל העדיפויות</SelectItem>
                <SelectItem value="urgent">דחוף</SelectItem>
                <SelectItem value="high">גבוהה</SelectItem>
                <SelectItem value="medium">בינונית</SelectItem>
                <SelectItem value="low">נמוכה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cities.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">עיר</label>
              <Select
                value={filters.city || 'all'}
                onValueChange={(v) => onFilterChange({ ...filters, city: v === 'all' ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר עיר" />
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
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">סוג לקוח</label>
            <Select
              value={filters.isVIP === undefined ? 'all' : filters.isVIP ? 'vip' : 'regular'}
              onValueChange={(v) =>
                onFilterChange({ ...filters, isVIP: v === 'all' ? undefined : v === 'vip' })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="regular">רגילים</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
