/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface DeliveryListItem {
  id: string;
  status: string;
  orderDate: string | Date;
  estimatedDeliveryDate?: string | Date | null;
  actualDeliveryDate?: string | Date | null;
  trackingNumber?: string | null;
  hasIssue: boolean;
  supplier: { id: string; name: string };
  purchaseOrder?: { id: string; orderNumber: string } | null;
  roomProduct?: { id: string; product?: { id: string; name: string; imageUrl?: string | null } | null } | null;
}

interface OverdueItem {
  id: string;
  estimatedDeliveryDate?: string | Date | null;
  supplier: { name: string };
  purchaseOrder?: { orderNumber: string } | null;
  roomProduct?: { product?: { name: string } | null } | null;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'warning' }> = {
  ordered: { label: 'הוזמן', variant: 'secondary' },
  confirmed: { label: 'אושר', variant: 'outline' },
  in_production: { label: 'בייצור', variant: 'outline' },
  ready_to_ship: { label: 'מוכן למשלוח', variant: 'default' },
  shipped: { label: 'נשלח', variant: 'default' },
  in_transit: { label: 'בדרך', variant: 'default' },
  out_for_delivery: { label: 'בדרך ללקוח', variant: 'default' },
  delivered: { label: 'נמסר', variant: 'default' },
  issue: { label: 'בעיה', variant: 'destructive' },
};

export function DeliveriesContent() {
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.deliveryTracking.list.useQuery({
    page,
    pageSize: 20,
    status: status as 'ordered' | 'shipped' | 'delivered' | undefined,
  });

  const { data: stats } = trpc.deliveryTracking.getStats.useQuery();
  const { data: overdue } = trpc.deliveryTracking.getOverdue.useQuery();
  const { data: issues } = trpc.deliveryTracking.getWithIssues.useQuery();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">מעקב משלוחים</h1>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className={overdue && overdue.length > 0 ? 'border-destructive' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">באיחור</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.overdue || 0}</div>
            </CardContent>
          </Card>
          <Card className={issues && issues.length > 0 ? 'border-warning' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">עם בעיות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.withIssues || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">צפוי השבוע</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.expectedThisWeek || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">בדרך</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.byStatus?.shipped || 0) + (stats?.byStatus?.in_transit || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {overdue && overdue.length > 0 && (
          <Card className="mb-6 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">משלוחים באיחור ({overdue.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdue.slice(0, 5).map((d: OverdueItem) => (
                  <div key={d.id} className="flex justify-between items-center text-sm">
                    <span>
                      {d.roomProduct?.product?.name || d.purchaseOrder?.orderNumber || 'משלוח'}
                      <span className="text-muted-foreground mr-2">({d.supplier.name})</span>
                    </span>
                    <span className="text-destructive">
                      צפוי: {d.estimatedDeliveryDate ? new Date(d.estimatedDeliveryDate).toLocaleDateString('he-IL') : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <div className="flex gap-4 mb-6">
          <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="ordered">הוזמן</SelectItem>
              <SelectItem value="confirmed">אושר</SelectItem>
              <SelectItem value="in_production">בייצור</SelectItem>
              <SelectItem value="shipped">נשלח</SelectItem>
              <SelectItem value="in_transit">בדרך</SelectItem>
              <SelectItem value="delivered">נמסר</SelectItem>
              <SelectItem value="issue">בעיה</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">טוען...</div>
        ) : !data?.items.length ? (
          <div className="text-center py-8 text-muted-foreground">אין משלוחים</div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>מוצר/הזמנה</TableHead>
                    <TableHead>ספק</TableHead>
                    <TableHead>תאריך הזמנה</TableHead>
                    <TableHead>אספקה צפויה</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((d: DeliveryListItem) => {
                    const isOverdue = d.estimatedDeliveryDate &&
                      new Date(d.estimatedDeliveryDate) < new Date() &&
                      !d.actualDeliveryDate;

                    return (
                      <TableRow key={d.id} className={isOverdue ? 'bg-destructive/5' : ''}>
                        <TableCell>
                          <div>
                            {d.roomProduct?.product?.name || d.purchaseOrder?.orderNumber || '-'}
                          </div>
                          {d.trackingNumber && (
                            <div className="text-xs text-muted-foreground">מעקב: {d.trackingNumber}</div>
                          )}
                        </TableCell>
                        <TableCell>{d.supplier.name}</TableCell>
                        <TableCell>{new Date(d.orderDate).toLocaleDateString('he-IL')}</TableCell>
                        <TableCell className={isOverdue ? 'text-destructive font-medium' : ''}>
                          {d.estimatedDeliveryDate
                            ? new Date(d.estimatedDeliveryDate).toLocaleDateString('he-IL')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusLabels[d.status]?.variant as 'default' || 'outline'}>
                            {statusLabels[d.status]?.label || d.status}
                          </Badge>
                          {d.hasIssue && <Badge variant="destructive" className="mr-1">בעיה</Badge>}
                        </TableCell>
                        <TableCell>
                          <Link href={`/deliveries/${d.id}` as Route}>
                            <Button variant="ghost" size="sm">צפייה</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  הקודם
                </Button>
                <span className="flex items-center px-3">עמוד {page} מתוך {data.totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage(page + 1)}>
                  הבא
                </Button>
              </div>
            )}
          </>
        )}
    </>
  );
}
