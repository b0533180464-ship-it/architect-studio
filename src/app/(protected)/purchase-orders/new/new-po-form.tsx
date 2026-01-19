/* eslint-disable max-lines-per-function, max-lines */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function NewPurchaseOrderForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    supplierId: '',
    expectedDelivery: '',
    paymentTerms: '',
    deliveryAddress: '',
    deliveryInstructions: '',
    notes: '',
    internalNotes: '',
  });

  const { data: projects } = trpc.projects.list.useQuery({ page: 1, pageSize: 100 });
  const { data: suppliers } = trpc.suppliers.list.useQuery({ page: 1, pageSize: 100 });

  const createMutation = trpc.purchaseOrders.create.useMutation({
    onSuccess: (data) => {
      router.push(`/purchase-orders/${data.id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        projectId: formData.projectId,
        supplierId: formData.supplierId,
        expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery) : undefined,
        paymentTerms: formData.paymentTerms || undefined,
        deliveryAddress: formData.deliveryAddress || undefined,
        deliveryInstructions: formData.deliveryInstructions || undefined,
        notes: formData.notes || undefined,
        internalNotes: formData.internalNotes || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">הזמנת רכש חדשה</h1>
      </div>

      <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>פרטי הזמנה</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="project">פרויקט *</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(v) => setFormData({ ...formData, projectId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר פרויקט" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.items.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplier">ספק *</Label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(v) => setFormData({ ...formData, supplierId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר ספק" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.items.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
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
            <Link href="/purchase-orders">
              <Button type="button" variant="outline">ביטול</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting || !formData.projectId || !formData.supplierId}>
              {isSubmitting ? 'יוצר...' : 'צור הזמנה'}
            </Button>
          </div>

          {createMutation.error && (
            <div className="mt-4 text-center text-destructive">{createMutation.error.message}</div>
          )}
        </form>
    </>
  );
}
