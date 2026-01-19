/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RoomProductsTable } from './room-products-table';
import { AddProductDialog } from './add-product-dialog';

interface ProjectProductsContentProps {
  projectId: string;
}

const APPROVAL_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'ממתין לאישור', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'מאושר', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'נדחה', color: 'bg-red-100 text-red-800' },
  revision_requested: { label: 'נדרשת תיקון', color: 'bg-orange-100 text-orange-800' },
};

const PROCUREMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  not_ordered: { label: 'לא הוזמן', color: 'bg-gray-100 text-gray-800' },
  quoted: { label: 'בקשת הצעת מחיר', color: 'bg-blue-100 text-blue-800' },
  ordered: { label: 'הוזמן', color: 'bg-indigo-100 text-indigo-800' },
  in_production: { label: 'בייצור', color: 'bg-purple-100 text-purple-800' },
  shipped: { label: 'נשלח', color: 'bg-cyan-100 text-cyan-800' },
  delivered: { label: 'נמסר', color: 'bg-teal-100 text-teal-800' },
  installed: { label: 'הותקן', color: 'bg-green-100 text-green-800' },
  issue: { label: 'בעיה', color: 'bg-red-100 text-red-800' },
};

function formatCurrency(amount: number, currency = 'ILS'): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProjectProductsContent({ projectId }: ProjectProductsContentProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | undefined>();
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string | undefined>();
  const [selectedProcurementStatus, setSelectedProcurementStatus] = useState<string | undefined>();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: ffeData, isLoading, refetch } = trpc.roomProducts.ffeSchedule.useQuery({
    projectId,
    roomId: selectedRoom,
    clientApprovalStatus: selectedApprovalStatus as 'pending' | 'approved' | 'rejected' | 'revision_requested' | undefined,
    procurementStatus: selectedProcurementStatus as 'not_ordered' | 'quoted' | 'ordered' | 'in_production' | 'shipped' | 'delivered' | 'installed' | 'issue' | undefined,
  });

  const { data: stats } = trpc.roomProducts.getStats.useQuery({ projectId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">טוען...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          FF&E Schedule - {ffeData?.project?.name}
        </h1>
        <Button onClick={() => setShowAddDialog(true)}>+ הוסף מוצר</Button>
      </div>
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">סה&quot;כ מוצרים</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalClientPrice)}
                </div>
                <div className="text-sm text-muted-foreground">סכום ללקוח</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingApproval}</div>
                <div className="text-sm text-muted-foreground">ממתינים לאישור</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.ordered}</div>
                <div className="text-sm text-muted-foreground">הוזמנו</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.installed}</div>
                <div className="text-sm text-muted-foreground">הותקנו</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{stats.withIssues}</div>
                <div className="text-sm text-muted-foreground">עם בעיות</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <Select
                value={selectedRoom || 'all'}
                onValueChange={(value) => setSelectedRoom(value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="כל החדרים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל החדרים</SelectItem>
                  {ffeData?.rooms?.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedApprovalStatus || 'all'}
                onValueChange={(value) =>
                  setSelectedApprovalStatus(value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="סטטוס אישור" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  {Object.entries(APPROVAL_STATUS_LABELS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedProcurementStatus || 'all'}
                onValueChange={(value) =>
                  setSelectedProcurementStatus(value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="סטטוס רכש" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  {Object.entries(PROCUREMENT_STATUS_LABELS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(selectedRoom || selectedApprovalStatus || selectedProcurementStatus) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRoom(undefined);
                    setSelectedApprovalStatus(undefined);
                    setSelectedProcurementStatus(undefined);
                  }}
                >
                  נקה סינון
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {ffeData?.summary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>סיכום</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <div className="text-sm text-muted-foreground">עלות</div>
                  <div className="text-xl font-bold">
                    {formatCurrency(ffeData.summary.totalCost)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">מחיר ללקוח</div>
                  <div className="text-xl font-bold text-primary">
                    {formatCurrency(ffeData.summary.totalClientPrice)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">רווח</div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(ffeData.summary.totalProfit)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">מרווח</div>
                  <div className="text-xl font-bold">
                    {ffeData.summary.totalClientPrice > 0
                      ? (
                          (ffeData.summary.totalProfit / ffeData.summary.totalClientPrice) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
              </div>

              {/* Status breakdown */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">לפי סטטוס אישור</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ffeData.summary.byApprovalStatus).map(([status, count]) => (
                    <Badge
                      key={status}
                      variant="secondary"
                      className={APPROVAL_STATUS_LABELS[status]?.color}
                    >
                      {APPROVAL_STATUS_LABELS[status]?.label}: {count}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-3">לפי סטטוס רכש</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ffeData.summary.byProcurementStatus).map(([status, count]) => (
                    <Badge
                      key={status}
                      variant="secondary"
                      className={PROCUREMENT_STATUS_LABELS[status]?.color}
                    >
                      {PROCUREMENT_STATUS_LABELS[status]?.label}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Table */}
        {ffeData?.items && ffeData.items.length > 0 ? (
          <RoomProductsTable
            items={ffeData.items}
            onRefresh={refetch}
            approvalLabels={APPROVAL_STATUS_LABELS}
            procurementLabels={PROCUREMENT_STATUS_LABELS}
          />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">לא נמצאו מוצרים בפרויקט</p>
              <Button onClick={() => setShowAddDialog(true)}>הוסף מוצר ראשון</Button>
            </CardContent>
          </Card>
        )}

      {/* Add Product Dialog */}
      <AddProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        projectId={projectId}
        rooms={ffeData?.rooms || []}
        onSuccess={() => {
          refetch();
          setShowAddDialog(false);
        }}
      />
    </>
  );
}
