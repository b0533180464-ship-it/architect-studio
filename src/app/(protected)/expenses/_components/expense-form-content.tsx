/* eslint-disable max-lines-per-function, complexity */
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
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight } from 'lucide-react';

interface FormData {
  projectId?: string;
  supplierId?: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  isBillable: boolean;
  markupPercent?: number;
  invoiceNumber?: string;
}

export function ExpenseFormContent({ id }: { id?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!id;
  const defaultProjectId = searchParams.get('projectId') || undefined;

  const { data: projects } = trpc.projects.list.useQuery({ pageSize: 100 });
  const { data: suppliers } = trpc.suppliers.list.useQuery({ pageSize: 100 });
  const { data: expense, isLoading } = trpc.expenses.getById.useQuery({ id: id! }, { enabled: isEdit });

  const createMutation = trpc.expenses.create.useMutation({ onSuccess: (data) => router.push(`/expenses/${data.id}`) });
  const updateMutation = trpc.expenses.update.useMutation({ onSuccess: () => router.push(`/expenses/${id}`) });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { currency: 'ILS', date: new Date().toISOString().split('T')[0], isBillable: false, projectId: defaultProjectId },
  });

  useEffect(() => {
    if (defaultProjectId && !isEdit) setValue('projectId', defaultProjectId);
  }, [defaultProjectId, isEdit, setValue]);

  useEffect(() => {
    if (expense) {
      setValue('projectId', expense.projectId ?? undefined);
      setValue('supplierId', expense.supplierId ?? undefined);
      setValue('description', expense.description);
      setValue('amount', expense.amount);
      setValue('currency', expense.currency);
      setValue('date', new Date(expense.date).toISOString().split('T')[0] ?? '');
      setValue('isBillable', expense.isBillable);
      setValue('markupPercent', expense.markupPercent ?? undefined);
      setValue('invoiceNumber', expense.invoiceNumber ?? undefined);
    }
  }, [expense, setValue]);

  const onSubmit = (data: FormData) => {
    if (isEdit && id) {
      updateMutation.mutate({ id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isLoading) return <div className="text-center py-8 text-muted-foreground">טוען...</div>;

  const isBillable = watch('isBillable');

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/expenses"><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-semibold">{isEdit ? 'עריכת הוצאה' : 'הוצאה חדשה'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader><CardTitle>פרטי הוצאה</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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

              <div className="space-y-2">
                <Label htmlFor="supplierId">ספק (אופציונלי)</Label>
                <Select value={watch('supplierId') ?? '__none__'} onValueChange={(v) => setValue('supplierId', v === '__none__' ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="בחר ספק" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">ללא ספק</SelectItem>
                    {suppliers?.items.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">תיאור *</Label>
              <Textarea {...register('description', { required: true })} placeholder="תיאור ההוצאה..." />
              {errors.description && <p className="text-sm text-destructive">שדה חובה</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="amount">סכום *</Label>
                <Input type="number" step="0.01" {...register('amount', { required: true, valueAsNumber: true })} />
                {errors.amount && <p className="text-sm text-destructive">שדה חובה</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">תאריך *</Label>
                <Input type="date" {...register('date', { required: true })} />
                {errors.date && <p className="text-sm text-destructive">שדה חובה</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">מספר חשבונית</Label>
                <Input {...register('invoiceNumber')} placeholder="מספר חשבונית..." />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="isBillable" checked={isBillable} onCheckedChange={(checked: boolean | 'indeterminate') => setValue('isBillable', checked === true)} />
              <Label htmlFor="isBillable" className="cursor-pointer">לחיוב לקוח</Label>
            </div>

            {isBillable && (
              <div className="space-y-2">
                <Label htmlFor="markupPercent">אחוז מרווח</Label>
                <Input type="number" step="0.1" {...register('markupPercent', { valueAsNumber: true })} placeholder="0" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'שמור שינויים' : 'צור הוצאה'}
          </Button>
          <Link href="/expenses"><Button type="button" variant="outline">ביטול</Button></Link>
        </div>
      </form>
    </>
  );
}
