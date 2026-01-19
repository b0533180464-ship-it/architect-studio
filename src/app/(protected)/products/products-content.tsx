/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Table } from 'lucide-react';
import { ProductsGrid } from './products-grid';
import { ProductsTable } from './products-table';
import { ProductsFilters } from './products-filters';
import { ProductsStats } from './products-stats';

type ViewMode = 'grid' | 'table';

export function ProductsContent() {
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ViewMode>('table');
  const [filters, setFilters] = useState<{
    categoryId?: string;
    supplierId?: string;
    hasImage?: boolean;
  }>({});

  const { data, isLoading } = trpc.products.list.useQuery({
    page,
    pageSize: view === 'grid' ? 24 : 50,
    ...filters,
  });
  const { data: categories } = trpc.products.getCategories.useQuery();
  const { data: suppliers } = trpc.suppliers.list.useQuery({ page: 1, pageSize: 100 });
  const { data: stats } = trpc.products.getStats.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); utils.products.getStats.invalidate(); },
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); utils.products.getStats.invalidate(); },
  });

  const handleUpdate = (id: string, field: string, value: unknown) => {
    updateMutation.mutate({ id, [field]: value });
  };

  const handleDelete = (id: string) => {
    if (confirm('האם למחוק את המוצר?')) {
      deleteMutation.mutate({ id });
    }
  };

  const products = data?.items || [];
  const pageSize = view === 'grid' ? 24 : 50;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">ספריית מוצרים</h1>
        <Link href="/products/new"><Button>+ מוצר חדש</Button></Link>
      </div>

      {stats && <ProductsStats stats={stats} />}

      <Card className="mt-6 mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <ProductsFilters
              filters={filters}
              categories={categories || []}
              suppliers={suppliers?.items || []}
              onFilterChange={(newFilters) => { setFilters(newFilters); setPage(1); }}
            />
            <div className="flex gap-1 border rounded-md p-1">
              <Button variant={view === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('table')}><Table className="h-4 w-4" /></Button>
              <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('grid')}><LayoutGrid className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{view === 'table' ? 'טבלת מוצרים' : 'גלריית מוצרים'}</CardTitle></CardHeader>
        <CardContent>
          {view === 'table' ? (
            <ProductsTable products={products} isLoading={isLoading} onUpdate={handleUpdate} onDelete={handleDelete} />
          ) : (
            <ProductsGrid products={products} />
          )}

          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                מציג {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, data.pagination.total)} מתוך {data.pagination.total}
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
