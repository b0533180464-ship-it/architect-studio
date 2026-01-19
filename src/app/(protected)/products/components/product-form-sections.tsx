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

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface FormData {
  name: string;
  sku: string;
  categoryId: string;
  description: string;
  supplierId: string;
  supplierSku: string;
  leadTimeDays: string;
  costPrice: string;
  retailPrice: string;
  currency: string;
  width: string;
  height: string;
  depth: string;
  unit: string;
  imageUrl: string;
  productUrl: string;
  specSheetUrl: string;
}

interface SectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

interface BasicInfoSectionProps extends SectionProps {
  categories?: Category[];
}

interface SupplierSectionProps extends SectionProps {
  suppliers?: { items: Supplier[] };
}

export function BasicInfoSection({ formData, onChange, categories }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>פרטים בסיסיים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">שם המוצר *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="sku">מק&quot;ט</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => onChange({ sku: e.target.value })}
          />
        </div>
        <CategorySelect
          value={formData.categoryId}
          onChange={(value) => onChange({ categoryId: value })}
          categories={categories}
        />
        <div>
          <Label htmlFor="description">תיאור</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  categories?: Category[];
}

function CategorySelect({ value, onChange, categories }: CategorySelectProps) {
  return (
    <div>
      <Label htmlFor="category">קטגוריה</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="בחר קטגוריה" />
        </SelectTrigger>
        <SelectContent>
          {categories?.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SupplierSection({ formData, onChange, suppliers }: SupplierSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ספק</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SupplierSelect
          value={formData.supplierId}
          onChange={(value) => onChange({ supplierId: value })}
          suppliers={suppliers}
        />
        <div>
          <Label htmlFor="supplierSku">מק&quot;ט ספק</Label>
          <Input
            id="supplierSku"
            value={formData.supplierSku}
            onChange={(e) => onChange({ supplierSku: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="leadTimeDays">זמן אספקה (ימים)</Label>
          <Input
            id="leadTimeDays"
            type="number"
            min="0"
            value={formData.leadTimeDays}
            onChange={(e) => onChange({ leadTimeDays: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface SupplierSelectProps {
  value: string;
  onChange: (value: string) => void;
  suppliers?: { items: Supplier[] };
}

function SupplierSelect({ value, onChange, suppliers }: SupplierSelectProps) {
  return (
    <div>
      <Label htmlFor="supplier">ספק</Label>
      <Select value={value} onValueChange={onChange}>
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
  );
}
