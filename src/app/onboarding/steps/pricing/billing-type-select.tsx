'use client';

import { Label } from '@/components/ui/label';

type BillingType = 'fixed' | 'hourly' | 'percentage' | 'cost_plus' | 'hybrid';

const BILLING_OPTIONS: { value: BillingType; label: string; desc: string }[] = [
  { value: 'fixed', label: 'מחיר קבוע', desc: 'עמלה קבועה לפרויקט' },
  { value: 'hourly', label: 'לפי שעה', desc: 'חיוב לפי שעות עבודה' },
  { value: 'cost_plus', label: 'עלות פלוס', desc: 'עלות + אחוז רווח' },
];

interface Props {
  value: BillingType;
  onChange: (value: BillingType) => void;
}

export function BillingTypeSelect({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label>שיטת תמחור ברירת מחדל</Label>
      <div className="space-y-2">
        {BILLING_OPTIONS.map((option) => (
          <BillingOption key={option.value} option={option} selected={value === option.value} onClick={() => onChange(option.value)} />
        ))}
      </div>
    </div>
  );
}

interface BillingOptionProps {
  option: typeof BILLING_OPTIONS[0];
  selected: boolean;
  onClick: () => void;
}

function BillingOption({ option, selected, onClick }: BillingOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border p-3 text-right transition-all ${
        selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
    >
      <p className="font-medium">{option.label}</p>
      <p className="text-sm text-muted-foreground">{option.desc}</p>
    </button>
  );
}
