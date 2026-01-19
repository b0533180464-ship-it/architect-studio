'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { BusinessTypeSelect } from './company/business-type-select';
import { TeamSizeSelect } from './company/team-size-select';

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function CompanyStep({ onNext }: StepProps) {
  const [formData, setFormData] = useState({
    name: '', businessType: 'interior_design' as const, teamSize: '1' as const,
    phone: '', website: '', address: '',
  });
  const [error, setError] = useState('');

  const mutation = trpc.onboarding.setupCompany.useMutation({
    onSuccess: () => onNext(),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate(formData);
  };

  const updateField = (key: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CompanyHeader />
      <CompanyForm formData={formData} updateField={updateField} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'שומר...' : 'המשך'}
      </Button>
    </form>
  );
}

function CompanyHeader() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold">ברוכים הבאים! 👋</h2>
      <p className="mt-2 text-muted-foreground">נתחיל עם פרטי המשרד שלך</p>
    </div>
  );
}

interface CompanyFormData {
  name: string; businessType: 'interior_design' | 'architecture' | 'both';
  teamSize: '1' | '2-5' | '6-10' | '11-20' | '20+'; phone: string; website: string; address: string;
}

interface CompanyFormProps {
  formData: CompanyFormData;
  updateField: (key: keyof CompanyFormData, value: string) => void;
}

function CompanyForm({ formData, updateField }: CompanyFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">שם המשרד *</Label>
        <Input id="name" value={formData.name} onChange={(e) => updateField('name', e.target.value)} required />
      </div>
      <BusinessTypeSelect value={formData.businessType} onChange={(v) => updateField('businessType', v)} />
      <TeamSizeSelect value={formData.teamSize} onChange={(v) => updateField('teamSize', v)} />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">טלפון</Label>
          <Input id="phone" type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">אתר אינטרנט</Label>
          <Input id="website" type="url" value={formData.website} onChange={(e) => updateField('website', e.target.value)} dir="ltr" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">כתובת</Label>
        <Input id="address" value={formData.address} onChange={(e) => updateField('address', e.target.value)} />
      </div>
    </div>
  );
}
