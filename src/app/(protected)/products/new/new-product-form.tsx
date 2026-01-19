/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export function NewProductForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    supplierId: '',
    supplierSku: '',
    costPrice: '',
    retailPrice: '',
    currency: 'ILS',
    width: '',
    height: '',
    depth: '',
    unit: 'cm',
    leadTimeDays: '',
    imageUrl: '',
    productUrl: '',
    specSheetUrl: '',
  });

  const { data: categories } = trpc.products.getCategories.useQuery();
  const { data: suppliers } = trpc.suppliers.list.useQuery({ page: 1, pageSize: 100 });
  const utils = trpc.useUtils();

  const createMutation = trpc.products.create.useMutation({
    onSuccess: (product) => {
      utils.products.list.invalidate();
      router.push(`/products/${product.id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        sku: formData.sku || undefined,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        supplierId: formData.supplierId || undefined,
        supplierSku: formData.supplierSku || undefined,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        retailPrice: formData.retailPrice ? parseFloat(formData.retailPrice) : undefined,
        currency: formData.currency,
        width: formData.width ? parseFloat(formData.width) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        depth: formData.depth ? parseFloat(formData.depth) : undefined,
        unit: formData.unit as 'cm' | 'in' | 'mm',
        leadTimeDays: formData.leadTimeDays ? parseInt(formData.leadTimeDays) : undefined,
        imageUrl: formData.imageUrl || undefined,
        productUrl: formData.productUrl || undefined,
        specSheetUrl: formData.specSheetUrl || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">מוצר חדש</h1>
      </div>

      <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Basic Info */}
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="לדוגמה: כורסה מעוצבת"
                  />
                </div>

                <div>
                  <Label htmlFor="sku">מק&quot;ט</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="לדוגמה: ARM-001"
                  />
                </div>

                <div>
                  <Label htmlFor="category">קטגוריה</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר קטגוריה" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
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
                    placeholder="תיאור מפורט של המוצר..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Supplier */}
            <Card>
              <CardHeader>
                <CardTitle>ספק</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="supplier">ספק</Label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר ספק" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.items.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
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
                    placeholder='מק"ט אצל הספק'
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
                    placeholder="לדוגמה: 14"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>מחירים</CardTitle>
              </CardHeader>
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
                      placeholder="0.00"
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
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="currency">מטבע</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ILS">ILS - שקל</SelectItem>
                      <SelectItem value="USD">USD - דולר</SelectItem>
                      <SelectItem value="EUR">EUR - אירו</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle>מידות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="width">רוחב</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">גובה</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="depth">עומק</Label>
                    <Input
                      id="depth"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.depth}
                      onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="unit">יחידת מידה</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">סנטימטר (cm)</SelectItem>
                      <SelectItem value="mm">מילימטר (mm)</SelectItem>
                      <SelectItem value="in">אינץ&apos; (in)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Media & Links */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>מדיה וקישורים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl">קישור לתמונה</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productUrl">קישור לדף מוצר</Label>
                    <Input
                      id="productUrl"
                      type="url"
                      value={formData.productUrl}
                      onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="specSheetUrl">קישור למפרט טכני</Label>
                    <Input
                      id="specSheetUrl"
                      type="url"
                      value={formData.specSheetUrl}
                      onChange={(e) => setFormData({ ...formData, specSheetUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-4">
            <Link href="/products">
              <Button type="button" variant="outline">
                ביטול
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting || !formData.name}>
              {isSubmitting ? 'שומר...' : 'צור מוצר'}
            </Button>
          </div>

          {/* Error */}
          {createMutation.error && (
            <div className="mt-4 text-center text-destructive">
              {createMutation.error.message}
            </div>
          )}
        </form>
    </>
  );
}
