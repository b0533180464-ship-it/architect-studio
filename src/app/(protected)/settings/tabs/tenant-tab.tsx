'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { TenantForm } from './tenant/tenant-form';
import type { Tenant, User } from '@prisma/client';

interface Props {
  tenant: Tenant | null | undefined;
  user: Partial<User> | null | undefined;
}

export function TenantTab({ tenant }: Props) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', website: '', vatRate: 17, currency: 'ILS',
  });
  const [message, setMessage] = useState('');
  const utils = trpc.useUtils();

  useEffect(() => {
    if (tenant) setFormData({
      name: tenant.name || '', email: tenant.email || '', phone: tenant.phone || '',
      address: tenant.address || '', website: tenant.website || '',
      vatRate: tenant.vatRate || 17, currency: tenant.currency || 'ILS',
    });
  }, [tenant]);

  const mutation = trpc.tenant.update.useMutation({
    onSuccess: () => { setMessage('הגדרות המשרד עודכנו בהצלחה'); utils.tenant.getCurrent.invalidate(); setTimeout(() => setMessage(''), 3000); },
    onError: (err) => setMessage(`שגיאה: ${err.message}`),
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate(formData); };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TenantHeader />
      <TenantForm formData={formData} setFormData={setFormData} />
      {message && <p className={`text-sm ${message.includes('שגיאה') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
      <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'שומר...' : 'שמור שינויים'}</Button>
    </form>
  );
}

function TenantHeader() {
  return (
    <div>
      <h2 className="text-lg font-semibold">פרטי המשרד</h2>
      <p className="text-sm text-muted-foreground">עדכן את פרטי המשרד שלך</p>
    </div>
  );
}
