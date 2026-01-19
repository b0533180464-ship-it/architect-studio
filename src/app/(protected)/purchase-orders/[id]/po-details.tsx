/* eslint-disable max-lines-per-function, max-lines, complexity, @next/next/no-img-element */
'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PurchaseOrderItem {
  id: string;
  description: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveredQuantity: number;
  product?: { id: string; name: string; imageUrl?: string | null } | null;
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

interface PurchaseOrderDetailsProps {
  purchaseOrderId: string;
}

export function PurchaseOrderDetails({ purchaseOrderId }: PurchaseOrderDetailsProps) {
  const utils = trpc.useUtils();
  const { data: po, isLoading } = trpc.purchaseOrders.getById.useQuery({ id: purchaseOrderId });

  const approveMutation = trpc.purchaseOrders.approve.useMutation({
    onSuccess: () => {
      utils.purchaseOrders.getById.invalidate({ id: purchaseOrderId });
    },
  });

  const updateStatusMutation = trpc.purchaseOrders.updateStatus.useMutation({
    onSuccess: () => {
      utils.purchaseOrders.getById.invalidate({ id: purchaseOrderId });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">טוען...</div>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">הזמנה לא נמצאה</p>
          <Link href="/purchase-orders"><Button variant="outline">חזרה לרשימה</Button></Link>
        </div>
      </div>
    );
  }

  const handleApprove = () => approveMutation.mutate({ id: purchaseOrderId });
  const handleConfirm = () => updateStatusMutation.mutate({ id: purchaseOrderId, status: 'confirmed' });
  const handleDeliver = () => updateStatusMutation.mutate({ id: purchaseOrderId, status: 'delivered' });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">{po.orderNumber}</h1>
          <Badge variant={statusLabels[po.status]?.variant || 'outline'}>
            {statusLabels[po.status]?.label || po.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {po.status === 'draft' && (
            <Button onClick={handleApprove} disabled={approveMutation.isPending}>
              {approveMutation.isPending ? 'מאשר...' : 'אשר ושלח'}
            </Button>
          )}
          {po.status === 'sent' && (
            <Button variant="outline" onClick={handleConfirm}>סמן כאושר</Button>
          )}
          {(po.status === 'shipped' || po.status === 'in_production') && (
            <Button variant="outline" onClick={handleDeliver}>סמן כנמסר</Button>
          )}
          <Link href={`/purchase-orders/${purchaseOrderId}/edit` as Route}>
            <Button variant="outline">עריכה</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>פרטי הזמנה</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">ספק</div>
                  <div className="font-medium">{po.supplier.name}</div>
                  {po.supplier.email && <div className="text-sm">{po.supplier.email}</div>}
                  {po.supplier.phone && <div className="text-sm">{po.supplier.phone}</div>}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">פרויקט</div>
                  <Link href={`/projects/${po.project.id}` as Route} className="font-medium hover:underline">
                    {po.project.name}
                  </Link>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">תאריך הזמנה</div>
                  <div className="font-medium">{new Date(po.orderDate).toLocaleDateString('he-IL')}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">אספקה צפויה</div>
                  <div className="font-medium">
                    {po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString('he-IL') : '-'}
                  </div>
                </div>
                {po.vendorOrderNumber && (
                  <div>
                    <div className="text-sm text-muted-foreground">מספר הזמנה אצל הספק</div>
                    <div className="font-medium">{po.vendorOrderNumber}</div>
                  </div>
                )}
                {po.paymentTerms && (
                  <div>
                    <div className="text-sm text-muted-foreground">תנאי תשלום</div>
                    <div className="font-medium">{po.paymentTerms}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>סיכום</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">סה&quot;כ פריטים:</span>
                <span>₪{po.subtotal.toLocaleString()}</span>
              </div>
              {po.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">הנחה:</span>
                  <span>-₪{po.discount.toLocaleString()}</span>
                </div>
              )}
              {po.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">משלוח:</span>
                  <span>₪{po.shippingCost.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">מע&quot;מ:</span>
                <span>₪{po.vatAmount.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>סה&quot;כ:</span>
                <span>₪{po.total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>פריטים ({po.items.length})</CardTitle>
              {po.status === 'draft' && (
                <Link href={`/purchase-orders/${purchaseOrderId}/items/add` as Route}>
                  <Button variant="outline" size="sm">+ הוסף פריט</Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {po.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">אין פריטים בהזמנה</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>תיאור</TableHead>
                      <TableHead>מק&quot;ט</TableHead>
                      <TableHead>כמות</TableHead>
                      <TableHead>מחיר יחידה</TableHead>
                      <TableHead>סה&quot;כ</TableHead>
                      <TableHead>נמסר</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {po.items.map((item: PurchaseOrderItem) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.product?.imageUrl && (
                              <img src={item.product.imageUrl} alt="" className="w-8 h-8 object-cover rounded" />
                            )}
                            {item.description}
                          </div>
                        </TableCell>
                        <TableCell>{item.sku || '-'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₪{item.unitPrice.toLocaleString()}</TableCell>
                        <TableCell>₪{item.totalPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          {item.deliveredQuantity}/{item.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(po.notes || po.internalNotes) && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>הערות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {po.notes && (
                    <div>
                      <div className="text-sm font-medium mb-1">הערות לספק</div>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">{po.notes}</div>
                    </div>
                  )}
                  {po.internalNotes && (
                    <div>
                      <div className="text-sm font-medium mb-1">הערות פנימיות</div>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">{po.internalNotes}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
    </>
  );
}
