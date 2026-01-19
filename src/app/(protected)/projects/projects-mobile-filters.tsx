/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfigSelect } from '@/components/ui/config-select';

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

interface MobileFiltersProps {
  filters: Filters;
  cities: string[];
  onFilterChange: (filters: Filters) => void;
  onClear: () => void;
}

export function MobileFilters({ filters, cities, onFilterChange, onClear }: MobileFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  return (
    <div className="space-y-4 pt-4">
      <div>
        <label className="text-sm font-medium text-slate-700 mb-1.5 block">סטטוס</label>
        <ConfigSelect
          entityType="project_status"
          value={localFilters.statusId || ''}
          onChange={(value) => setLocalFilters({ ...localFilters, statusId: value || undefined })}
          placeholder="בחר סטטוס"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-1.5 block">שלב</label>
        <ConfigSelect
          entityType="project_phase"
          value={localFilters.phaseId || ''}
          onChange={(value) => setLocalFilters({ ...localFilters, phaseId: value || undefined })}
          placeholder="בחר שלב"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-1.5 block">סוג פרויקט</label>
        <ConfigSelect
          entityType="project_type"
          value={localFilters.typeId || ''}
          onChange={(value) => setLocalFilters({ ...localFilters, typeId: value || undefined })}
          placeholder="בחר סוג"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-1.5 block">עדיפות</label>
        <Select
          value={localFilters.priority || 'all'}
          onValueChange={(v) =>
            setLocalFilters({ ...localFilters, priority: v === 'all' ? undefined : (v as Filters['priority']) })
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
            value={localFilters.city || 'all'}
            onValueChange={(v) => setLocalFilters({ ...localFilters, city: v === 'all' ? undefined : v })}
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
          value={localFilters.isVIP === undefined ? 'all' : localFilters.isVIP ? 'vip' : 'regular'}
          onValueChange={(v) =>
            setLocalFilters({ ...localFilters, isVIP: v === 'all' ? undefined : v === 'vip' })
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

      <div className="flex gap-2 pt-4 border-t border-slate-200">
        <Button variant="outline" className="flex-1" onClick={onClear}>
          נקה הכל
        </Button>
        <Button className="flex-1" onClick={handleApply}>
          החל פילטרים
        </Button>
      </div>
    </div>
  );
}
