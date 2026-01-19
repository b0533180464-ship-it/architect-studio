/* eslint-disable max-lines-per-function, max-lines */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  supplierId: string;
  supplierSku: string;
  costPrice: string;
  retailPrice: string;
  currency: string;
  width: string;
  height: string;
  depth: string;
  unit: string;
  leadTimeDays: string;
  imageUrl: string;
  productUrl: string;
  specSheetUrl: string;
}

interface Category { id: string; name: string; }
interface Supplier { id: string; name: string; }

interface BasicInfoProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  categories?: Category[];
}

export function BasicInfoCard({ formData, setFormData, categories }: BasicInfoProps) {
  return (
    <Card>
      <CardHeader><CardTitle>פרטים בסיסיים</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">שם המוצר *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="sku">מק&quot;ט</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="category">קטגוריה</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
          >
            <SelectTrigger><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
            <SelectContent>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="description">תיאור</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface SupplierProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  suppliers?: { items: Supplier[] };
}

export function SupplierCard({ formData, setFormData, suppliers }: SupplierProps) {
  return (
    <Card>
      <CardHeader><CardTitle>ספק</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="supplier">ספק</Label>
          <Select
            value={formData.supplierId}
            onValueChange={(v) => setFormData({ ...formData, supplierId: v })}
          >
            <SelectTrigger><SelectValue placeholder="בחר ספק" /></SelectTrigger>
            <SelectContent>
              {suppliers?.items.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="supplierSku">מק&quot;ט ספק</Label>
          <Input
            id="supplierSku"
            value={formData.supplierSku}
            onChange={(e) => setFormData({ ...formData, supplierSku: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="leadTimeDays">זמן אספקה (ימים)</Label>
          <Input
            id="leadTimeDays"
            type="number"
            min="0"
            value={formData.leadTimeDays}
            onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface PricingProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

export function PricingCard({ formData, setFormData }: PricingProps) {
  return (
    <Card>
      <CardHeader><CardTitle>מחירים</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="costPrice">מחיר עלות</Label>
            <Input
              id="costPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="retailPrice">מחיר מחירון</Label>
            <Input
              id="retailPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.retailPrice}
              onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="currency">מטבע</Label>
          <Select
            value={formData.currency}
            onValueChange={(v) => setFormData({ ...formData, currency: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ILS">ILS - שקל</SelectItem>
              <SelectItem value="USD">USD - דולר</SelectItem>
              <SelectItem value="EUR">EUR - אירו</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
