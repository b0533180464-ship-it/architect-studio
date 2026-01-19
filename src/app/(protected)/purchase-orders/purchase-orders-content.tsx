/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PurchaseOrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  orderDate: string | Date;
  total: number;
  supplier: { id: string; name: string };
  project: { id: string; name: string };
  _count: { items: number };
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'טיוטה', variant: 'secondary' },
  pending_approval: { label: 'ממתין לאישור', variant: 'outline' },
  sent: { label: 'נשלח', variant: 'default' },
  confirmed: { label: 'אושר', variant: 'default' },
  in_production: { label: 'בייצור', variant: 'outline' },
  partial: { label: 'חלקי', variant: 'outline' },
  shipped: { label: 'נשלח', variant: 'default' },
  delivered: { label: 'נמסר', variant: 'default' },
  completed: { label: 'הושלם', variant: 'default' },
  cancelled: { label: 'בוטל', variant: 'destructive' },
};

export function PurchaseOrdersContent() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.purchaseOrders.list.useQuery({
    page,
    pageSize: 20,
    search: search || undefined,
    status: status as 'draft' | 'sent' | 'confirmed' | undefined,
  });

  const { data: stats } = trpc.purchaseOrders.getStats.useQuery();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">הזמנות רכש</h1>
        <Link href="/purchase-orders/new">
          <Button>+ הזמנה חדשה</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">סה&quot;כ הזמנות</div>
            <div className="text-2xl font-bold">{Object.values(stats?.byStatus || {}).reduce((a: number, b: number) => a + b, 0)}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">החודש</div>
            <div className="text-2xl font-bold">{stats?.thisMonth.count || 0}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">בטיפול</div>
            <div className="text-2xl font-bold">
              {(stats?.byStatus?.sent || 0) + (stats?.byStatus?.confirmed || 0) + (stats?.byStatus?.in_production || 0)}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">סה&quot;כ ₪</div>
            <div className="text-2xl font-bold">{stats?.totalAmount?.toLocaleString() || 0}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="חיפוש..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="draft">טיוטה</SelectItem>
              <SelectItem value="sent">נשלח</SelectItem>
              <SelectItem value="confirmed">אושר</SelectItem>
              <SelectItem value="in_production">בייצור</SelectItem>
              <SelectItem value="shipped">נשלח</SelectItem>
              <SelectItem value="delivered">נמסר</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">טוען...</div>
        ) : !data?.items.length ? (
          <div className="text-center py-8 text-muted-foreground">אין הזמנות רכש</div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>מספר הזמנה</TableHead>
                    <TableHead>ספק</TableHead>
                    <TableHead>פרויקט</TableHead>
                    <TableHead>תאריך</TableHead>
                    <TableHead>פריטים</TableHead>
                    <TableHead>סכום</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((po: PurchaseOrderListItem) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.orderNumber}</TableCell>
                      <TableCell>{po.supplier.name}</TableCell>
                      <TableCell>{po.project.name}</TableCell>
                      <TableCell>{new Date(po.orderDate).toLocaleDateString('he-IL')}</TableCell>
                      <TableCell>{po._count.items}</TableCell>
                      <TableCell>₪{po.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusLabels[po.status]?.variant || 'outline'}>
                          {statusLabels[po.status]?.label || po.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/purchase-orders/${po.id}` as Route}>
                          <Button variant="ghost" size="sm">צפייה</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  הקודם
                </Button>
                <span className="flex items-center px-3">
                  עמוד {page} מתוך {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  הבא
                </Button>
              </div>
            )}
          </>
        )}
    </>
  );
}
