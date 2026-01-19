/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Archive, Plus, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfigSelect } from '@/components/ui/config-select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProjectsTable } from './projects-table';
import { MoreFiltersDropdown } from './projects-filters-dropdown';
import { MobileFilters } from './projects-mobile-filters';

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

export function ProjectsContent() {
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get('clientId') || undefined;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({ clientId: initialClientId });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data, isLoading, error } = trpc.projects.list.useQuery({
    page,
    pageSize: 20,
    search: search || undefined,
    ...filters,
  });

  const { data: cities } = trpc.projects.getCities.useQuery();
  const { data: stats } = trpc.projects.getStats.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => { utils.projects.list.invalidate(); },
  });

  const handleUpdate = (id: string, field: string, value: unknown) => {
    updateMutation.mutate({ id, [field]: value });
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ clientId: filters.clientId });
    setPage(1);
  };

  const activeFiltersCount = [
    filters.typeId,
    filters.statusId,
    filters.phaseId,
    filters.priority,
    filters.isVIP !== undefined,
    filters.city,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header - Desktop */}
      <div className="hidden md:block text-center">
        <h1 className="text-2xl font-bold text-slate-900">פרויקטים</h1>
        {stats && (
          <p className="mt-1 text-slate-500">
            {stats.active} פרויקטים פעילים מתוך {stats.total}
          </p>
        )}
      </div>

      {/* Header - Mobile */}
      <div className="flex md:hidden items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">פרויקטים</h1>
          {stats && (
            <p className="text-sm text-slate-500">
              {stats.active} פעילים מתוך {stats.total}
            </p>
          )}
        </div>
        <Link href="/projects/new">
          <Button size="sm">
            <Plus className="h-4 w-4 ml-1" />
            חדש
          </Button>
        </Link>
      </div>

      {/* Search Bar - Full Width */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="חיפוש פרויקטים..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pr-10 h-12 text-base"
        />
      </div>

      {/* Filters Row - Desktop/Tablet */}
      <div className="hidden md:flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-[130px]">
            <ConfigSelect
              entityType="project_status"
              value={filters.statusId || ''}
              onChange={(value) => handleFilterChange({ ...filters, statusId: value || undefined })}
              placeholder="סטטוס"
            />
          </div>
          <div className="w-[130px]">
            <ConfigSelect
              entityType="project_phase"
              value={filters.phaseId || ''}
              onChange={(value) => handleFilterChange({ ...filters, phaseId: value || undefined })}
              placeholder="שלב"
            />
          </div>
          <div className="w-[140px]">
            <ConfigSelect
              entityType="project_type"
              value={filters.typeId || ''}
              onChange={(value) => handleFilterChange({ ...filters, typeId: value || undefined })}
              placeholder="סוג פרויקט"
            />
          </div>
          <MoreFiltersDropdown filters={filters} cities={cities || []} onFilterChange={handleFilterChange} />
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-slate-500">
              <X className="h-4 w-4 ml-1" />
              נקה ({activeFiltersCount})
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filters.includeArchived ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange({ ...filters, includeArchived: !filters.includeArchived })}
          >
            <Archive className="h-4 w-4 ml-1" />
            {filters.includeArchived ? 'כולל ארכיון' : 'ארכיון'}
          </Button>
          <Link href="/projects/new">
            <Button>
              <Plus className="h-4 w-4 ml-1" />
              פרויקט חדש
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Row - Mobile */}
      <div className="flex md:hidden items-center gap-2">
        <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              <Filter className="h-4 w-4 ml-2" />
              סינון
              {activeFiltersCount > 0 && (
                <span className="mr-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>סינון פרויקטים</DialogTitle>
            </DialogHeader>
            <MobileFilters
              filters={filters}
              cities={cities || []}
              onFilterChange={(newFilters) => {
                handleFilterChange(newFilters);
                setMobileFiltersOpen(false);
              }}
              onClear={() => {
                handleClearFilters();
                setMobileFiltersOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
        <Button
          variant={filters.includeArchived ? 'secondary' : 'outline'}
          onClick={() => handleFilterChange({ ...filters, includeArchived: !filters.includeArchived })}
        >
          <Archive className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-slate-500">טוען...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-500">שגיאה בטעינת הנתונים</div>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-slate-500 mb-4">לא נמצאו פרויקטים</p>
            <Link href="/projects/new">
              <Button variant="outline">צור פרויקט ראשון</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <ProjectsTable projects={data.items} onUpdate={handleUpdate} />
            </div>
            {data.pagination.totalPages > 1 && (
              <div className="border-t border-slate-100 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-500">
                    מציג {(page - 1) * 20 + 1}-{Math.min(page * 20, data.pagination.total)} מתוך {data.pagination.total}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                      הקודם
                    </Button>
                    <Button variant="outline" size="sm" disabled={!data.pagination.hasMore} onClick={() => setPage((p) => p + 1)}>
                      הבא
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
