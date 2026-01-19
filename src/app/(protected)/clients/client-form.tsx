/* eslint-disable max-lines, max-lines-per-function, complexity */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ClientFormProps {
  client?: {
    id: string;
    name: string;
    type: string;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    preferredCommunication: string;
    address: string | null;
    city: string | null;
    status: string;
    notes: string | null;
    companyNumber: string | null;
    contactPerson: string | null;
  };
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    name: client?.name || '',
    type: client?.type || 'individual',
    email: client?.email || '',
    phone: client?.phone || '',
    mobile: client?.mobile || '',
    preferredCommunication: client?.preferredCommunication || 'whatsapp',
    address: client?.address || '',
    city: client?.city || '',
    status: client?.status || 'lead',
    notes: client?.notes || '',
    companyNumber: client?.companyNumber || '',
    contactPerson: client?.contactPerson || '',
  });

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      router.push('/clients');
    },
  });

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      utils.clients.getById.invalidate({ id: client!.id });
      router.push(`/clients/${client!.id}`);
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      mobile: formData.mobile || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      notes: formData.notes || undefined,
      companyNumber: formData.companyNumber || undefined,
      contactPerson: formData.contactPerson || undefined,
    } as Parameters<typeof createMutation.mutate>[0];

    if (client) {
      updateMutation.mutate({ ...data, id: client.id });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{client ? 'עריכת לקוח' : 'לקוח חדש'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error.message}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">שם הלקוח *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">סוג לקוח</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">פרטי</SelectItem>
                    <SelectItem value="company">חברה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">ליד</SelectItem>
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="past">לקוח עבר</SelectItem>
                  <SelectItem value="inactive">לא פעיל</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-medium">פרטי התקשרות</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">נייד</Label>
                <Input
                  id="mobile"
                  dir="ltr"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredCommunication">דרך תקשורת מועדפת</Label>
                <Select
                  value={formData.preferredCommunication}
                  onValueChange={(value) =>
                    setFormData({ ...formData, preferredCommunication: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">אימייל</SelectItem>
                    <SelectItem value="phone">טלפון</SelectItem>
                    <SelectItem value="whatsapp">וואטסאפ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-medium">כתובת</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">כתובת</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">עיר</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Company Details (if company) */}
          {formData.type === 'company' && (
            <div className="space-y-4">
              <h3 className="font-medium">פרטי חברה</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyNumber">ח.פ / ע.מ</Label>
                  <Input
                    id="companyNumber"
                    dir="ltr"
                    value={formData.companyNumber}
                    onChange={(e) => setFormData({ ...formData, companyNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">איש קשר</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <textarea
              id="notes"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'שומר...' : client ? 'שמור שינויים' : 'צור לקוח'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
