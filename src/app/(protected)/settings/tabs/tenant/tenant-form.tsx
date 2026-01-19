'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormData {
  name: string; email: string; phone: string; address: string; website: string; vatRate: number; currency: string;
}

interface Props {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export function TenantForm({ formData, setFormData }: Props) {
  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => setFormData({ ...formData, [key]: value });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">שם המשרד</Label>
        <Input id="name" value={formData.name} onChange={(e) => update('name', e.target.value)} />
      </div>
      <ContactFields formData={formData} update={update} />
      <div className="space-y-2">
        <Label htmlFor="address">כתובת</Label>
        <Input id="address" value={formData.address} onChange={(e) => update('address', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">אתר אינטרנט</Label>
        <Input id="website" type="url" value={formData.website} onChange={(e) => update('website', e.target.value)} dir="ltr" />
      </div>
      <FinancialFields formData={formData} update={update} />
    </div>
  );
}

function ContactFields({ formData, update }: { formData: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="email">אימייל</Label>
        <Input id="email" type="email" value={formData.email} onChange={(e) => update('email', e.target.value)} dir="ltr" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">טלפון</Label>
        <Input id="phone" type="tel" value={formData.phone} onChange={(e) => update('phone', e.target.value)} dir="ltr" />
      </div>
    </div>
  );
}

function FinancialFields({ formData, update }: { formData: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="vatRate">אחוז מע״מ</Label>
        <Input id="vatRate" type="number" min="0" max="100" value={formData.vatRate}
          onChange={(e) => update('vatRate', Number(e.target.value))} dir="ltr" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">מטבע</Label>
        <Input id="currency" value={formData.currency} maxLength={3}
          onChange={(e) => update('currency', e.target.value.toUpperCase())} dir="ltr" />
      </div>
    </div>
  );
}
