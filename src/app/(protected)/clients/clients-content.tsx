/* eslint-disable max-lines-per-function */
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Old table - kept for backup, can switch back if needed
// import { ClientsTable } from './clients-table';
// New generic table with custom fields and views
import { GenericClientsTable } from './generic-clients-table';
import { ClientsFilters } from './clients-filters';

export function ClientsContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{
    status?: 'lead' | 'active' | 'past' | 'inactive';
    type?: 'individual' | 'company';
    city?: string;
  }>({});

  const { data, isLoading, error } = trpc.clients.list.useQuery({
    page,
    pageSize: 20,
    search: search || undefined,
    ...filters,
  });

  // Get client IDs for bulk custom field values fetch
  const clientIds = useMemo(() => data?.items.map((c) => c.id) ?? [], [data?.items]);

  // Fetch custom field values for all clients in the current page
  const { data: customFieldValuesRaw } = trpc.customFields.getValuesBulk.useQuery(
    { entityType: 'client', entityIds: clientIds },
    { enabled: clientIds.length > 0 }
  );

  // Convert to Map for GenericDataTable
  const customFieldValues = useMemo(() => {
    if (!customFieldValuesRaw) return undefined;
    return new Map(Object.entries(customFieldValuesRaw));
  }, [customFieldValuesRaw]);

  const { data: cities } = trpc.clients.getCities.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); },
  });

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); },
  });

  const setCustomFieldMutation = trpc.customFields.setValues.useMutation({
    onSuccess: () => { utils.customFields.getValuesBulk.invalidate(); },
  });

  const handleUpdate = (id: string, field: string, value: unknown) => {
    updateMutation.mutate({ id, [field]: value });
  };

  const handleCustomFieldUpdate = (id: string, fieldKey: string, value: unknown) => {
    setCustomFieldMutation.mutate({
      entityType: 'client',
      entityId: id,
      values: { [fieldKey]: value },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק לקוח זה?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">לקוחות</h1>
        <Link href="/clients/new">
          <Button>+ לקוח חדש</Button>
        </Link>
      </div>

      <Card>
          <CardContent className="p-6">
            {/* Search and Filters */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 max-w-sm">
                <Input
                  placeholder="חיפוש לקוחות..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <ClientsFilters
                filters={filters}
                cities={cities || []}
                onFilterChange={(newFilters) => {
                  setFilters(newFilters);
                  setPage(1);
                }}
              />
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-muted-foreground">טוען...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-destructive">
                שגיאה בטעינת הנתונים
              </div>
            ) : !data?.items.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">לא נמצאו לקוחות</p>
                <Link href="/clients/new">
                  <Button variant="outline">הוסף לקוח ראשון</Button>
                </Link>
              </div>
            ) : (
              <>
                <GenericClientsTable
                  clients={data.items}
                  customFieldValues={customFieldValues}
                  onUpdate={handleUpdate}
                  onUpdateCustomField={handleCustomFieldUpdate}
                  onDelete={handleDelete}
                />

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      מציג {(page - 1) * 20 + 1}-{Math.min(page * 20, data.pagination.total)} מתוך {data.pagination.total}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        הקודם
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!data.pagination.hasMore}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        הבא
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
    </>
  );
}
