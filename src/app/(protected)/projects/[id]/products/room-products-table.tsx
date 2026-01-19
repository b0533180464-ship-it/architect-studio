/* eslint-disable max-lines-per-function, max-lines */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditRoomProductDialog } from './edit-room-product-dialog';

interface RoomProduct {
  id: string;
  quantity: number;
  costPrice: number;
  clientPrice: number;
  totalCost: number;
  totalClientPrice: number;
  profit: number;
  clientApprovalStatus: string;
  procurementStatus: string;
  hasIssue: boolean;
  estimatedDeliveryDate: Date | null;
  actualDeliveryDate: Date | null;
  product: {
    id: string;
    name: string;
    sku: string | null;
    imageUrl: string | null;
    supplier: { id: string; name: string } | null;
  };
  room: { id: string; name: string };
}

interface RoomProductsTableProps {
  items: RoomProduct[];
  onRefresh: () => void;
  approvalLabels: Record<string, { label: string; color: string }>;
  procurementLabels: Record<string, { label: string; color: string }>;
}

function formatCurrency(amount: number, currency = 'ILS'): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('he-IL');
}

export function RoomProductsTable({
  items,
  onRefresh,
  approvalLabels,
  procurementLabels,
}: RoomProductsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const updateApprovalMutation = trpc.roomProducts.updateApproval.useMutation({
    onSuccess: () => {
      onRefresh();
    },
  });

  const updateProcurementMutation = trpc.roomProducts.updateProcurement.useMutation({
    onSuccess: () => {
      onRefresh();
    },
  });

  const deleteMutation = trpc.roomProducts.delete.useMutation({
    onSuccess: () => {
      onRefresh();
      setDeleteId(null);
    },
  });

  // Group by room
  const groupedByRoom = items.reduce(
    (acc, item) => {
      const roomId = item.room.id;
      if (!acc[roomId]) {
        acc[roomId] = { room: item.room, items: [] };
      }
      acc[roomId].items.push(item);
      return acc;
    },
    {} as Record<string, { room: { id: string; name: string }; items: RoomProduct[] }>
  );

  return (
    <div className="space-y-6">
      {Object.entries(groupedByRoom).map(([roomId, { room, items: roomItems }]) => (
        <Card key={roomId}>
          <CardHeader>
            <CardTitle className="text-lg">{room.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-2 font-medium">מוצר</th>
                    <th className="text-right py-3 px-2 font-medium">כמות</th>
                    <th className="text-right py-3 px-2 font-medium">מחיר ליחידה</th>
                    <th className="text-right py-3 px-2 font-medium">סה&quot;כ</th>
                    <th className="text-right py-3 px-2 font-medium">אישור</th>
                    <th className="text-right py-3 px-2 font-medium">סטטוס רכש</th>
                    <th className="text-right py-3 px-2 font-medium">אספקה</th>
                    <th className="text-right py-3 px-2 font-medium">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {roomItems.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                      {/* Product */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded bg-muted flex-shrink-0">
                            {item.product.imageUrl ? (
                              <Image
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-muted-foreground">
                                <svg
                                  className="h-6 w-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/products/${item.product.id}`}
                              className="font-medium hover:underline"
                            >
                              {item.product.name}
                            </Link>
                            {item.product.sku && (
                              <div className="text-xs text-muted-foreground">
                                מק&quot;ט: {item.product.sku}
                              </div>
                            )}
                            {item.product.supplier && (
                              <div className="text-xs text-muted-foreground">
                                {item.product.supplier.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-2">{item.quantity}</td>

                      {/* Unit Price */}
                      <td className="py-3 px-2">{formatCurrency(item.clientPrice)}</td>

                      {/* Total */}
                      <td className="py-3 px-2 font-medium">
                        {formatCurrency(item.totalClientPrice)}
                      </td>

                      {/* Approval Status */}
                      <td className="py-3 px-2">
                        <Select
                          value={item.clientApprovalStatus}
                          onValueChange={(value) =>
                            updateApprovalMutation.mutate({
                              id: item.id,
                              status: value as 'pending' | 'approved' | 'rejected' | 'revision_requested',
                            })
                          }
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <Badge
                              variant="secondary"
                              className={approvalLabels[item.clientApprovalStatus]?.color}
                            >
                              {approvalLabels[item.clientApprovalStatus]?.label}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(approvalLabels).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Procurement Status */}
                      <td className="py-3 px-2">
                        <Select
                          value={item.procurementStatus}
                          onValueChange={(value) =>
                            updateProcurementMutation.mutate({
                              id: item.id,
                              status: value as 'not_ordered' | 'quoted' | 'ordered' | 'in_production' | 'shipped' | 'delivered' | 'installed' | 'issue',
                            })
                          }
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <Badge
                              variant="secondary"
                              className={procurementLabels[item.procurementStatus]?.color}
                            >
                              {procurementLabels[item.procurementStatus]?.label}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(procurementLabels).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Delivery Date */}
                      <td className="py-3 px-2">
                        {item.actualDeliveryDate ? (
                          <span className="text-green-600">
                            {formatDate(item.actualDeliveryDate)}
                          </span>
                        ) : item.estimatedDeliveryDate ? (
                          <span>{formatDate(item.estimatedDeliveryDate)}</span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditId(item.id)}>
                            ערוך
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)}>
                            מחק
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת מוצר</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך להסיר את המוצר מהחדר?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <EditRoomProductDialog
        open={!!editId}
        onOpenChange={(open) => !open && setEditId(null)}
        roomProductId={editId}
        onSuccess={onRefresh}
      />
    </div>
  );
}
