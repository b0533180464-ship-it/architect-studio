/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProfessionalsTable } from './professionals-table';
import { ProfessionalsFilters } from './professionals-filters';

export function ProfessionalsContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{ tradeId?: string }>({});

  const { data, isLoading, error } = trpc.professionals.list.useQuery({
    page,
    pageSize: 20,
    search: search || undefined,
    ...filters,
  });

  const { data: trades } = trpc.config.list.useQuery({ entityType: 'trade', activeOnly: true });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">בעלי מקצוע</h1>
        <Link href="/professionals/new">
          <Button>+ בעל מקצוע חדש</Button>
        </Link>
      </div>

      <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 max-w-sm">
                <Input
                  placeholder="חיפוש בעלי מקצוע..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <ProfessionalsFilters
                filters={filters}
                trades={trades || []}
                onFilterChange={(newFilters) => {
                  setFilters(newFilters);
                  setPage(1);
                }}
              />
            </div>

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
                <p className="text-muted-foreground mb-4">לא נמצאו בעלי מקצוע</p>
                <Link href="/professionals/new">
                  <Button variant="outline">הוסף בעל מקצוע ראשון</Button>
                </Link>
              </div>
            ) : (
              <>
                <ProfessionalsTable professionals={data.items} />

                {data.pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      מציג {(page - 1) * 20 + 1}-{Math.min(page * 20, data.pagination.total)} מתוך{' '}
                      {data.pagination.total}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
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
