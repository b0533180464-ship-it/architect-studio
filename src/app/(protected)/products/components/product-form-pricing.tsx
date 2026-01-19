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

interface PricingData {
  costPrice: string;
  retailPrice: string;
  currency: string;
}

interface PricingSectionProps {
  data: PricingData;
  onChange: (data: Partial<PricingData>) => void;
}

export function PricingSection({ data, onChange }: PricingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>מחירים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CostPriceInput value={data.costPrice} onChange={(v) => onChange({ costPrice: v })} />
        <RetailPriceInput value={data.retailPrice} onChange={(v) => onChange({ retailPrice: v })} />
        <CurrencySelect value={data.currency} onChange={(v) => onChange({ currency: v })} />
      </CardContent>
    </Card>
  );
}

function CostPriceInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor="costPrice">מחיר עלות</Label>
      <Input
        id="costPrice"
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function RetailPriceInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor="retailPrice">מחיר מחירון</Label>
      <Input
        id="retailPrice"
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function CurrencySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor="currency">מטבע</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ILS">שקל (ILS)</SelectItem>
          <SelectItem value="USD">דולר (USD)</SelectItem>
          <SelectItem value="EUR">יורו (EUR)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
