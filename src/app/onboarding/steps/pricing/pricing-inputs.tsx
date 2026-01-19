'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormData {
  hourlyRate: number;
  markupPercent: number;
  vatRate: number;
  currency: string;
}

interface Props {
  formData: FormData;
  updateField: (key: keyof FormData, value: number | string) => void;
}

export function PricingInputs({ formData, updateField }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">תעריף שעתי (₪)</Label>
          <Input id="hourlyRate" type="number" min="0" value={formData.hourlyRate}
            onChange={(e) => updateField('hourlyRate', Number(e.target.value))} dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="markupPercent">אחוז רווח (%)</Label>
          <Input id="markupPercent" type="number" min="0" max="100" value={formData.markupPercent}
            onChange={(e) => updateField('markupPercent', Number(e.target.value))} dir="ltr" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vatRate">אחוז מע״מ</Label>
          <Input id="vatRate" type="number" min="0" max="100" value={formData.vatRate}
            onChange={(e) => updateField('vatRate', Number(e.target.value))} dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">מטבע</Label>
          <Input id="currency" value={formData.currency} maxLength={3}
            onChange={(e) => updateField('currency', e.target.value.toUpperCase())} dir="ltr" />
        </div>
      </div>
    </>
  );
}
