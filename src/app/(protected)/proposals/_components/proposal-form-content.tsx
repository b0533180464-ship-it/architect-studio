/* eslint-disable max-lines-per-function, complexity, max-lines */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight } from 'lucide-react';
import { ProposalItemsManager } from './proposal-items-manager';

interface FormData {
  clientId: string;
  projectId?: string;
  title: string;
  introduction?: string;
  scope?: string;
  terms?: string;
  discountAmount?: number;
  discountType?: 'percent' | 'fixed';
  discountReason?: string;
  vatRate: number;
  validUntil?: string;
  requiresSignature: boolean;
}

export function ProposalFormContent({ id }: { id?: string }) {
  const router = useRouter();
  const isEdit = !!id;

  const { data: clients } = trpc.clients.list.useQuery({ pageSize: 100 });
  const { data: projects } = trpc.projects.list.useQuery({ pageSize: 100 });
  const { data: proposal, isLoading } = trpc.proposals.getById.useQuery({ id: id! }, { enabled: isEdit });

  const createMutation = trpc.proposals.create.useMutation({ onSuccess: (data) => router.push(`/proposals/${data.id}`) });
  const updateMutation = trpc.proposals.update.useMutation({ onSuccess: () => router.push(`/proposals/${id}`) });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { vatRate: 17, requiresSignature: false },
  });

  useEffect(() => {
    if (proposal) {
      setValue('clientId', proposal.clientId);
      setValue('projectId', proposal.projectId ?? undefined);
      setValue('title', proposal.title);
      setValue('introduction', proposal.introduction ?? undefined);
      setValue('scope', proposal.scope ?? undefined);
      setValue('terms', proposal.terms ?? undefined);
      setValue('discountAmount', proposal.discountAmount ?? undefined);
      setValue('discountType', proposal.discountType as 'percent' | 'fixed' ?? undefined);
      setValue('discountReason', proposal.discountReason ?? undefined);
      setValue('vatRate', proposal.vatRate);
      setValue('validUntil', proposal.validUntil ? new Date(proposal.validUntil).toISOString().split('T')[0] : undefined);
      setValue('requiresSignature', proposal.requiresSignature);
    }
  }, [proposal, setValue]);

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate({ id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isLoading) return <div className="text-center py-8 text-muted-foreground">טוען...</div>;

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/proposals"><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-semibold">{isEdit ? 'עריכת הצעת מחיר' : 'הצעת מחיר חדשה'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader><CardTitle>פרטים בסיסיים</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientId">לקוח *</Label>
                <Select value={watch('clientId')} onValueChange={(v) => setValue('clientId', v)}>
                  <SelectTrigger><SelectValue placeholder="בחר לקוח" /></SelectTrigger>
                  <SelectContent>
                    {clients?.items.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.clientId && <p className="text-sm text-destructive">שדה חובה</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectId">פרויקט (אופציונלי)</Label>
                <Select value={watch('projectId') ?? '__none__'} onValueChange={(v) => setValue('projectId', v === '__none__' ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="בחר פרויקט" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">ללא פרויקט</SelectItem>
                    {projects?.items.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">כותרת ההצעה *</Label>
              <Input {...register('title', { required: true })} placeholder="הצעת מחיר לפרויקט..." />
              {errors.title && <p className="text-sm text-destructive">שדה חובה</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">תוקף עד</Label>
              <Input type="date" {...register('validUntil')} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>תוכן ההצעה</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="introduction">מבוא</Label>
              <Textarea {...register('introduction')} placeholder="מבוא והקדמה..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope">היקף העבודה</Label>
              <Textarea {...register('scope')} placeholder="תיאור היקף העבודה..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">תנאים</Label>
              <Textarea {...register('terms')} placeholder="תנאי התשלום והסכם..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>הנחה ומע&quot;מ</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="discountAmount">סכום הנחה</Label>
                <Input type="number" step="0.01" {...register('discountAmount', { valueAsNumber: true })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountType">סוג הנחה</Label>
                <Select value={watch('discountType') ?? '__none__'} onValueChange={(v) => setValue('discountType', v === '__none__' ? undefined : v as 'percent' | 'fixed')}>
                  <SelectTrigger><SelectValue placeholder="בחר סוג" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">ללא</SelectItem>
                    <SelectItem value="percent">אחוז</SelectItem>
                    <SelectItem value="fixed">קבוע</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vatRate">אחוז מע&quot;מ</Label>
                <Input type="number" {...register('vatRate', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountReason">סיבת ההנחה</Label>
              <Input {...register('discountReason')} placeholder="סיבת ההנחה (אופציונלי)" />
            </div>
          </CardContent>
        </Card>

        {/* Proposal Items - only in edit mode */}
        {isEdit && id && proposal?.status === 'draft' && (
          <div className="mb-6">
            <ProposalItemsManager proposalId={id} />
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'שמור שינויים' : 'צור הצעה'}
          </Button>
          <Link href="/proposals"><Button type="button" variant="outline">ביטול</Button></Link>
        </div>
      </form>
    </>
  );
}
