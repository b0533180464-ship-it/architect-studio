/* eslint-disable max-lines-per-function */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface DimensionsProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

export function DimensionsCard({ formData, setFormData }: DimensionsProps) {
  return (
    <Card>
      <CardHeader><CardTitle>מידות</CardTitle></CardHeader>
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
            onValueChange={(v) => setFormData({ ...formData, unit: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">סנטימטר (cm)</SelectItem>
              <SelectItem value="mm">מילימטר (mm)</SelectItem>
              <SelectItem value="in">אינץ&apos; (in)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export function MediaLinksCard({ formData, setFormData }: DimensionsProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader><CardTitle>מדיה וקישורים</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="imageUrl">קישור לתמונה</Label>
          <Input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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
            />
          </div>
          <div>
            <Label htmlFor="specSheetUrl">קישור למפרט טכני</Label>
            <Input
              id="specSheetUrl"
              type="url"
              value={formData.specSheetUrl}
              onChange={(e) => setFormData({ ...formData, specSheetUrl: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
