/* eslint-disable max-lines-per-function */
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

type PaymentType = 'retainer' | 'milestone' | 'scheduled' | 'final' | 'change_order' | 'hourly' | 'expense';

interface FormData {
  projectId: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  paymentType: PaymentType;
  dueDate?: string;
  milestoneDescription?: string;
  percentageOfBudget?: number;
}

const paymentTypes = [
  { value: 'retainer', label: 'מקדמה' },
  { value: 'milestone', label: 'אבן דרך' },
  { value: 'scheduled', label: 'מתוזמן' },
  { value: 'final', label: 'סופי' },
  { value: 'change_order', label: 'שינויים' },
  { value: 'hourly', label: 'לפי שעות' },
  { value: 'expense', label: 'הוצאות' },
];

export function PaymentFormContent({ id }: { id?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!id;
  const defaultProjectId = searchParams.get('projectId') || '';

  const { data: projects } = trpc.projects.list.useQuery({ pageSize: 100 });
  const { data: payment, isLoading } = trpc.payments.getById.useQuery({ id: id! }, { enabled: isEdit });

  const createMutation = trpc.payments.create.useMutation({ onSuccess: (data) => router.push(`/payments/${data.id}`) });
  const updateMutation = trpc.payments.update.useMutation({ onSuccess: () => router.push(`/payments/${id}`) });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { currency: 'ILS', paymentType: 'milestone', projectId: defaultProjectId },
  });

  useEffect(() => {
    if (defaultProjectId && !isEdit) setValue('projectId', defaultProjectId);
  }, [defaultProjectId, isEdit, setValue]);

  useEffect(() => {
    if (payment) {
      setValue('projectId', payment.projectId);
      setValue('name', payment.name);
      setValue('description', payment.description ?? undefined);
      setValue('amount', payment.amount);
      setValue('currency', payment.currency);
      setValue('paymentType', payment.paymentType as PaymentType);
      setValue('dueDate', payment.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : undefined);
      setValue('milestoneDescription', payment.milestoneDescription ?? undefined);
      setValue('percentageOfBudget', payment.percentageOfBudget ?? undefined);
    }
  }, [payment, setValue]);

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
        <Link href="/payments"><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-semibold">{isEdit ? 'עריכת תשלום' : 'תשלום חדש'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader><CardTitle>פרטי תשלום</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="projectId">פרויקט *</Label>
                <Select value={watch('projectId')} onValueChange={(v) => setValue('projectId', v)}>
                  <SelectTrigger><SelectValue placeholder="בחר פרויקט" /></SelectTrigger>
                  <SelectContent>
                    {projects?.items.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.projectId && <p className="text-sm text-destructive">שדה חובה</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentType">סוג תשלום *</Label>
                <Select value={watch('paymentType')} onValueChange={(v) => setValue('paymentType', v as PaymentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {paymentTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">שם התשלום *</Label>
              <Input {...register('name', { required: true })} placeholder="תשלום עבור..." />
              {errors.name && <p className="text-sm text-destructive">שדה חובה</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">סכום *</Label>
                <Input type="number" step="0.01" {...register('amount', { required: true, valueAsNumber: true })} />
                {errors.amount && <p className="text-sm text-destructive">שדה חובה</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">תאריך יעד</Label>
                <Input type="date" {...register('dueDate')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea {...register('description')} placeholder="פרטים נוספים..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="milestoneDescription">תיאור אבן דרך</Label>
              <Input {...register('milestoneDescription')} placeholder="אבן דרך / שלב..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'שמור שינויים' : 'צור תשלום'}
          </Button>
          <Link href="/payments"><Button type="button" variant="outline">ביטול</Button></Link>
        </div>
      </form>
    </>
  );
}
