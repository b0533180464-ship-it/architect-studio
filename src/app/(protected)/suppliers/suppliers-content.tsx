/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SuppliersTable } from './suppliers-table';
import { SuppliersFilters } from './suppliers-filters';

export function SuppliersContent() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    categoryId?: string;
    city?: string;
    hasTradeAccount?: boolean;
  }>({});

  const { data, isLoading } = trpc.suppliers.list.useQuery({
    page,
    pageSize: 50,
    ...filters,
  });
  const { data: cities } = trpc.suppliers.getCities.useQuery();
  const { data: categories } = trpc.config.list.useQuery({ entityType: 'supplier_category', activeOnly: true });
  const utils = trpc.useUtils();

  const updateMutation = trpc.suppliers.update.useMutation({
    onSuccess: () => { utils.suppliers.list.invalidate(); },
  });

  const deleteMutation = trpc.suppliers.delete.useMutation({
    onSuccess: () => { utils.suppliers.list.invalidate(); },
  });

  const handleUpdate = (id: string, field: string, value: unknown) => {
    updateMutation.mutate({ id, [field]: value });
  };

  const handleDelete = (id: string) => {
    if (confirm('האם למחוק את הספק?')) {
      deleteMutation.mutate({ id });
    }
  };

  const suppliers = data?.items || [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">ספקים</h1>
        <Link href="/suppliers/new"><Button>+ ספק חדש</Button></Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-4">
          <SuppliersFilters
            filters={filters}
            cities={cities || []}
            categories={categories || []}
            onFilterChange={(newFilters) => { setFilters(newFilters); setPage(1); }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>טבלת ספקים</CardTitle></CardHeader>
        <CardContent>
          <SuppliersTable suppliers={suppliers} isLoading={isLoading} onUpdate={handleUpdate} onDelete={handleDelete} />

          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                מציג {(page - 1) * 50 + 1}-{Math.min(page * 50, data.pagination.total)} מתוך {data.pagination.total}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>הקודם</Button>
                <Button variant="outline" size="sm" disabled={!data.pagination.hasMore} onClick={() => setPage((p) => p + 1)}>הבא</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
