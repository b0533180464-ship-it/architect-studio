/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EditPurchaseOrderContentProps {
  purchaseOrderId: string;
}

export function EditPurchaseOrderContent({ purchaseOrderId }: EditPurchaseOrderContentProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vendorOrderNumber: '',
    expectedDelivery: '',
    paymentTerms: '',
    deliveryAddress: '',
    deliveryInstructions: '',
    notes: '',
    internalNotes: '',
    discount: 0,
    shippingCost: 0,
  });

  const { data: po, isLoading } = trpc.purchaseOrders.getById.useQuery({ id: purchaseOrderId });
  const utils = trpc.useUtils();

  const updateMutation = trpc.purchaseOrders.update.useMutation({
    onSuccess: () => {
      utils.purchaseOrders.getById.invalidate({ id: purchaseOrderId });
      router.push(`/purchase-orders/${purchaseOrderId}`);
    },
  });

  useEffect(() => {
    if (po) {
      setFormData({
        vendorOrderNumber: po.vendorOrderNumber || '',
        expectedDelivery: po.expectedDelivery
          ? (new Date(po.expectedDelivery).toISOString().split('T')[0] ?? '')
          : '',
        paymentTerms: po.paymentTerms || '',
        deliveryAddress: (po.deliveryAddress as string) || '',
        deliveryInstructions: po.deliveryInstructions || '',
        notes: po.notes || '',
        internalNotes: po.internalNotes || '',
        discount: po.discount || 0,
        shippingCost: po.shippingCost || 0,
      });
    }
  }, [po]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        id: purchaseOrderId,
        vendorOrderNumber: formData.vendorOrderNumber || undefined,
        expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery) : null,
        paymentTerms: formData.paymentTerms || undefined,
        deliveryAddress: formData.deliveryAddress || undefined,
        deliveryInstructions: formData.deliveryInstructions || undefined,
        notes: formData.notes || undefined,
        internalNotes: formData.internalNotes || undefined,
        discount: formData.discount || undefined,
        shippingCost: formData.shippingCost || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Link href="/purchase-orders">
            <Button variant="outline">חזרה לרשימה</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">עריכת הזמנה {po.orderNumber}</h1>
          <p className="text-muted-foreground">
            {po.supplier.name} • {po.project.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>פרטי הזמנה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vendorOrderNumber">מספר הזמנה אצל הספק</Label>
                <Input
                  id="vendorOrderNumber"
                  value={formData.vendorOrderNumber}
                  onChange={(e) => setFormData({ ...formData, vendorOrderNumber: e.target.value })}
                  placeholder="מספר אישור/הזמנה מהספק"
                />
              </div>
              <div>
                <Label htmlFor="expectedDelivery">תאריך אספקה צפוי</Label>
                <Input
                  id="expectedDelivery"
                  type="date"
                  value={formData.expectedDelivery}
                  onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="paymentTerms">תנאי תשלום</Label>
                <Input
                  id="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  placeholder="לדוגמה: שוטף + 30"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>עלויות נוספות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="discount">הנחה (₪)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="shippingCost">עלות משלוח (₪)</Label>
                <Input
                  id="shippingCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.shippingCost}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>כתובת ומשלוח</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="deliveryAddress">כתובת אספקה</Label>
                <Textarea
                  id="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="deliveryInstructions">הוראות אספקה</Label>
                <Textarea
                  id="deliveryInstructions"
                  value={formData.deliveryInstructions}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryInstructions: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>הערות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">הערות לספק</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="internalNotes">הערות פנימיות</Label>
                <Textarea
                  id="internalNotes"
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex items-center justify-end gap-4">
          <Link href={`/purchase-orders/${purchaseOrderId}` as Route}>
            <Button type="button" variant="outline">
              ביטול
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </div>

        {updateMutation.error && (
          <div className="mt-4 text-center text-destructive">{updateMutation.error.message}</div>
        )}
      </form>
    </>
  );
}
