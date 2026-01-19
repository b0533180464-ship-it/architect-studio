/* eslint-disable max-lines-per-function, complexity, max-lines */
'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfigSelect } from '@/components/ui/config-select';
import { useRouter } from 'next/navigation';

interface Professional {
  id: string;
  name: string;
  companyName: string | null;
  tradeId: string;
  phone: string;
  email: string | null;
  licenseNumber: string | null;
  insuranceExpiry: Date | null;
  rating: number | null;
  notes: string | null;
  specialties: string[];
}

interface ProfessionalFormProps {
  professional?: Professional;
  onSuccess?: () => void;
}

export function ProfessionalForm({ professional, onSuccess }: ProfessionalFormProps) {
  const router = useRouter();
  const isEdit = !!professional;
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    name: professional?.name || '',
    companyName: professional?.companyName || '',
    tradeId: professional?.tradeId || '',
    phone: professional?.phone || '',
    email: professional?.email || '',
    licenseNumber: professional?.licenseNumber || '',
    insuranceExpiry: professional?.insuranceExpiry
      ? new Date(professional.insuranceExpiry).toISOString().split('T')[0]
      : '',
    rating: professional?.rating?.toString() || '',
    notes: professional?.notes || '',
    specialties: professional?.specialties?.join(', ') || '',
  });

  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.name,
        companyName: professional.companyName || '',
        tradeId: professional.tradeId,
        phone: professional.phone,
        email: professional.email || '',
        licenseNumber: professional.licenseNumber || '',
        insuranceExpiry: professional.insuranceExpiry
          ? new Date(professional.insuranceExpiry).toISOString().split('T')[0]
          : '',
        rating: professional.rating?.toString() || '',
        notes: professional.notes || '',
        specialties: professional.specialties?.join(', ') || '',
      });
    }
  }, [professional]);

  const createMutation = trpc.professionals.create.useMutation({
    onSuccess: () => {
      utils.professionals.list.invalidate();
      if (onSuccess) onSuccess();
      else router.push('/professionals');
    },
  });

  const updateMutation = trpc.professionals.update.useMutation({
    onSuccess: () => {
      utils.professionals.list.invalidate();
      if (professional) utils.professionals.getById.invalidate({ id: professional.id });
      if (onSuccess) onSuccess();
      else router.push('/professionals');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const specialtiesArray = formData.specialties
      ? formData.specialties.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name: formData.name,
      companyName: formData.companyName || undefined,
      tradeId: formData.tradeId,
      phone: formData.phone,
      email: formData.email || undefined,
      licenseNumber: formData.licenseNumber || undefined,
      insuranceExpiry: formData.insuranceExpiry || undefined,
      rating: formData.rating ? parseInt(formData.rating) : undefined,
      notes: formData.notes || undefined,
      specialties: specialtiesArray.length > 0 ? specialtiesArray : undefined,
    };

    if (isEdit && professional) {
      updateMutation.mutate({ id: professional.id, ...payload });
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
          <Label htmlFor="name">שם *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="שם בעל המקצוע"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">שם חברה</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="שם החברה (אופציונלי)"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>מקצוע *</Label>
        <ConfigSelect
          entityType="trade"
          value={formData.tradeId}
          onChange={(v) => setFormData({ ...formData, tradeId: v })}
          placeholder="בחר מקצוע..."
        />
      </div>

      {/* Contact Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">טלפון *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="050-1234567"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">אימייל</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>
      </div>

      {/* License Info */}
      <div className="border-t pt-4">
        <h3 className="font-medium mb-4">רישיון וביטוח</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">מספר רישיון</Label>
            <Input
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              placeholder="מספר רישיון (אם יש)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insuranceExpiry">תוקף ביטוח</Label>
            <Input
              id="insuranceExpiry"
              type="date"
              value={formData.insuranceExpiry}
              onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Rating & Specialties */}
      <div className="border-t pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rating">דירוג (1-5)</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              placeholder="5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialties">התמחויות</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
              placeholder="שיפוץ, בנייה חדשה (מופרד בפסיק)"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">הערות</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="הערות נוספות..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          ביטול
        </Button>
        <Button type="submit" disabled={isPending || !formData.tradeId}>
          {isPending ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור בעל מקצוע'}
        </Button>
      </div>
    </form>
  );
}
