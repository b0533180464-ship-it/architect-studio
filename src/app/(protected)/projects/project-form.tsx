/* eslint-disable max-lines, max-lines-per-function, complexity, react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { ConfigSelect } from '@/components/ui/config-select';

interface ProjectFormProps {
  project?: {
    id: string;
    name: string;
    description: string | null;
    code: string | null;
    clientId: string;
    typeId: string | null;
    statusId: string | null;
    phaseId: string | null;
    priority: string;
    isVIP: boolean;
    address: string | null;
    city: string | null;
    area: number | null;
    budget: number | null;
    billingType: string;
    fixedFee: number | null;
    startDate: Date | null;
    expectedEndDate: Date | null;
    scope: string | null;
  };
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  const initialClientId = project?.clientId || searchParams.get('clientId') || '';

  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    code: project?.code || '',
    clientId: initialClientId,
    typeId: project?.typeId || '',
    statusId: project?.statusId || '',
    phaseId: project?.phaseId || '',
    priority: project?.priority || 'medium',
    isVIP: project?.isVIP || false,
    address: project?.address || '',
    city: project?.city || '',
    area: project?.area?.toString() || '',
    budget: project?.budget?.toString() || '',
    billingType: project?.billingType || 'fixed',
    fixedFee: project?.fixedFee?.toString() || '',
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    expectedEndDate: project?.expectedEndDate ? new Date(project.expectedEndDate).toISOString().split('T')[0] : '',
    scope: project?.scope || '',
  });

  const { data: clients } = trpc.clients.search.useQuery(
    { query: 'a' },
    { enabled: !initialClientId }
  );

  // If we have an initial client ID, get the client details
  const { data: selectedClient } = trpc.clients.getById.useQuery(
    { id: initialClientId },
    { enabled: !!initialClientId }
  );

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: (data) => {
      utils.projects.list.invalidate();
      router.push(`/projects/${data.id}`);
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      utils.projects.getById.invalidate({ id: project!.id });
      router.push(`/projects/${project!.id}`);
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      clientId: formData.clientId,
      description: formData.description || undefined,
      code: formData.code || undefined,
      typeId: formData.typeId || undefined,
      statusId: formData.statusId || undefined,
      phaseId: formData.phaseId || undefined,
      priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
      isVIP: formData.isVIP,
      address: formData.address || undefined,
      city: formData.city || undefined,
      area: formData.area ? parseFloat(formData.area) : undefined,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      billingType: formData.billingType as 'fixed' | 'hourly' | 'percentage' | 'cost_plus' | 'hybrid',
      fixedFee: formData.fixedFee ? parseFloat(formData.fixedFee) : undefined,
      startDate: formData.startDate || undefined,
      expectedEndDate: formData.expectedEndDate || undefined,
      scope: formData.scope || undefined,
    };

    if (project) {
      updateMutation.mutate({ ...data, id: project.id });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{project ? 'עריכת פרויקט' : 'פרויקט חדש'}</CardTitle>
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
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">שם הפרויקט *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">קוד פרויקט</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="PRJ-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientId">לקוח *</Label>
                {selectedClient ? (
                  <Input value={selectedClient.name} disabled />
                ) : (
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר לקוח" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Classification */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>סוג פרויקט</Label>
                <ConfigSelect
                  entityType="project_type"
                  value={formData.typeId}
                  onChange={(value) => setFormData({ ...formData, typeId: value })}
                  placeholder="בחר סוג פרויקט"
                />
              </div>
              <div className="space-y-2">
                <Label>סטטוס</Label>
                <ConfigSelect
                  entityType="project_status"
                  value={formData.statusId}
                  onChange={(value) => setFormData({ ...formData, statusId: value })}
                  placeholder="בחר סטטוס"
                />
              </div>
              <div className="space-y-2">
                <Label>שלב</Label>
                <ConfigSelect
                  entityType="project_phase"
                  value={formData.phaseId}
                  onChange={(value) => setFormData({ ...formData, phaseId: value })}
                  placeholder="בחר שלב"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="priority">עדיפות</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">נמוכה</SelectItem>
                    <SelectItem value="medium">בינונית</SelectItem>
                    <SelectItem value="high">גבוהה</SelectItem>
                    <SelectItem value="urgent">דחוף</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 h-10">
                  <input
                    type="checkbox"
                    checked={formData.isVIP}
                    onChange={(e) => setFormData({ ...formData, isVIP: e.target.checked })}
                    className="rounded border-input"
                  />
                  <span>פרויקט VIP</span>
                </label>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-medium">מיקום</h3>
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
              <div className="space-y-2">
                <Label htmlFor="area">שטח (מ"ר)</Label>
                <Input
                  id="area"
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-4">
            <h3 className="font-medium">תקציב ותמחור</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="budget">תקציב (₪)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingType">סוג תמחור</Label>
                <Select
                  value={formData.billingType}
                  onValueChange={(value) => setFormData({ ...formData, billingType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">מחיר קבוע</SelectItem>
                    <SelectItem value="hourly">שעתי</SelectItem>
                    <SelectItem value="percentage">אחוז מתקציב</SelectItem>
                    <SelectItem value="cost_plus">Cost+</SelectItem>
                    <SelectItem value="hybrid">משולב</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.billingType === 'fixed' && (
                <div className="space-y-2">
                  <Label htmlFor="fixedFee">שכ"ט (₪)</Label>
                  <Input
                    id="fixedFee"
                    type="number"
                    value={formData.fixedFee}
                    onChange={(e) => setFormData({ ...formData, fixedFee: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="font-medium">תאריכים</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">תאריך התחלה</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedEndDate">תאריך יעד</Label>
                <Input
                  id="expectedEndDate"
                  type="date"
                  value={formData.expectedEndDate}
                  onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Scope */}
          <div className="space-y-2">
            <Label htmlFor="scope">היקף עבודה</Label>
            <textarea
              id="scope"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.scope}
              onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading || !formData.clientId}>
              {isLoading ? 'שומר...' : project ? 'שמור שינויים' : 'צור פרויקט'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
