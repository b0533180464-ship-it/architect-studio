/* eslint-disable max-lines-per-function, complexity, max-lines */
'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ConfigSelect } from '@/components/ui/config-select';
import { useRouter } from 'next/navigation';

interface Supplier {
  id: string;
  name: string;
  categoryId: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  contactPerson: string | null;
  address: string | null;
  city: string | null;
  companyNumber: string | null;
  paymentTerms: string | null;
  discountPercent: number | null;
  creditDays: number | null;
  minimumOrder: number | null;
  hasTradeAccount: boolean;
  tradeAccountNumber: string | null;
  tradeDiscountPercent: number | null;
  rating: number | null;
  reliabilityScore: number | null;
  notes: string | null;
}

interface SupplierFormProps {
  supplier?: Supplier;
  onSuccess?: () => void;
}

export function SupplierForm({ supplier, onSuccess }: SupplierFormProps) {
  const router = useRouter();
  const isEdit = !!supplier;
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    categoryId: supplier?.categoryId || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    website: supplier?.website || '',
    contactPerson: supplier?.contactPerson || '',
    address: supplier?.address || '',
    city: supplier?.city || '',
    companyNumber: supplier?.companyNumber || '',
    paymentTerms: supplier?.paymentTerms || '',
    discountPercent: supplier?.discountPercent?.toString() || '',
    creditDays: supplier?.creditDays?.toString() || '',
    minimumOrder: supplier?.minimumOrder?.toString() || '',
    hasTradeAccount: supplier?.hasTradeAccount || false,
    tradeAccountNumber: supplier?.tradeAccountNumber || '',
    tradeDiscountPercent: supplier?.tradeDiscountPercent?.toString() || '',
    rating: supplier?.rating?.toString() || '',
    notes: supplier?.notes || '',
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        categoryId: supplier.categoryId || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        website: supplier.website || '',
        contactPerson: supplier.contactPerson || '',
        address: supplier.address || '',
        city: supplier.city || '',
        companyNumber: supplier.companyNumber || '',
        paymentTerms: supplier.paymentTerms || '',
        discountPercent: supplier.discountPercent?.toString() || '',
        creditDays: supplier.creditDays?.toString() || '',
        minimumOrder: supplier.minimumOrder?.toString() || '',
        hasTradeAccount: supplier.hasTradeAccount || false,
        tradeAccountNumber: supplier.tradeAccountNumber || '',
        tradeDiscountPercent: supplier.tradeDiscountPercent?.toString() || '',
        rating: supplier.rating?.toString() || '',
        notes: supplier.notes || '',
      });
    }
  }, [supplier]);

  const createMutation = trpc.suppliers.create.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/suppliers');
      }
    },
  });

  const updateMutation = trpc.suppliers.update.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
      if (supplier) utils.suppliers.getById.invalidate({ id: supplier.id });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/suppliers');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      categoryId: formData.categoryId || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      website: formData.website || undefined,
      contactPerson: formData.contactPerson || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      companyNumber: formData.companyNumber || undefined,
      paymentTerms: formData.paymentTerms || undefined,
      discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : undefined,
      creditDays: formData.creditDays ? parseInt(formData.creditDays) : undefined,
      minimumOrder: formData.minimumOrder ? parseFloat(formData.minimumOrder) : undefined,
      hasTradeAccount: formData.hasTradeAccount,
      tradeAccountNumber: formData.tradeAccountNumber || undefined,
      tradeDiscountPercent: formData.tradeDiscountPercent ? parseFloat(formData.tradeDiscountPercent) : undefined,
      rating: formData.rating ? parseInt(formData.rating) : undefined,
      notes: formData.notes || undefined,
    };

    if (isEdit && supplier) {
      updateMutation.mutate({ id: supplier.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">שם הספק *</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="שם הספק" required />
        </div>
        <div className="space-y-2">
          <Label>קטגוריה</Label>
          <ConfigSelect entityType="supplier_category" value={formData.categoryId} onChange={(v) => setFormData({ ...formData, categoryId: v })} placeholder="בחר קטגוריה..." />
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">אימייל</Label>
          <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">טלפון</Label>
          <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="03-1234567" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="website">אתר אינטרנט</Label>
          <Input id="website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPerson">איש קשר</Label>
          <Input id="contactPerson" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} placeholder="שם איש הקשר" />
        </div>
      </div>

      {/* Address */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">כתובת</Label>
          <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="רחוב, מספר" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">עיר</Label>
          <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="תל אביב" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyNumber">ח.פ. / עוסק</Label>
        <Input id="companyNumber" value={formData.companyNumber} onChange={(e) => setFormData({ ...formData, companyNumber: e.target.value })} placeholder="מספר חברה / עוסק מורשה" className="md:w-1/2" />
      </div>

      {/* Commercial Terms */}
      <div className="border-t pt-4">
        <h3 className="font-medium mb-4">תנאים מסחריים</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">תנאי תשלום</Label>
            <Input id="paymentTerms" value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} placeholder="שוטף + 30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountPercent">הנחה (%)</Label>
            <Input id="discountPercent" type="number" step="0.01" min="0" max="100" value={formData.discountPercent} onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })} placeholder="10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditDays">ימי אשראי</Label>
            <Input id="creditDays" type="number" min="0" value={formData.creditDays} onChange={(e) => setFormData({ ...formData, creditDays: e.target.value })} placeholder="30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minimumOrder">הזמנה מינימלית (₪)</Label>
            <Input id="minimumOrder" type="number" step="0.01" min="0" value={formData.minimumOrder} onChange={(e) => setFormData({ ...formData, minimumOrder: e.target.value })} placeholder="500" />
          </div>
        </div>
      </div>

      {/* Trade Account */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-3 mb-4">
          <Switch id="hasTradeAccount" checked={formData.hasTradeAccount} onCheckedChange={(checked) => setFormData({ ...formData, hasTradeAccount: checked })} />
          <Label htmlFor="hasTradeAccount">יש חשבון מסחר (Trade Account)</Label>
        </div>
        {formData.hasTradeAccount && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tradeAccountNumber">מספר חשבון</Label>
              <Input id="tradeAccountNumber" value={formData.tradeAccountNumber} onChange={(e) => setFormData({ ...formData, tradeAccountNumber: e.target.value })} placeholder="מספר חשבון מסחר" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradeDiscountPercent">הנחת Trade (%)</Label>
              <Input id="tradeDiscountPercent" type="number" step="0.01" min="0" max="100" value={formData.tradeDiscountPercent} onChange={(e) => setFormData({ ...formData, tradeDiscountPercent: e.target.value })} placeholder="15" />
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="border-t pt-4">
        <div className="space-y-2 md:w-1/4">
          <Label htmlFor="rating">דירוג (1-5)</Label>
          <Input id="rating" type="number" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} placeholder="5" />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">הערות</Label>
        <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="הערות נוספות..." rows={3} />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          ביטול
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור ספק'}
        </Button>
      </div>
    </form>
  );
}
