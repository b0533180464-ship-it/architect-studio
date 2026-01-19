/* eslint-disable max-lines-per-function */
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

type RetainerType = 'project_retainer' | 'general_retainer' | 'deposit' | 'trust_account';

interface FormData {
  clientId: string;
  projectId?: string;
  type: RetainerType;
  amount: number;
  currency: string;
  notes?: string;
}

export function RetainerFormContent({ id }: { id?: string }) {
  const router = useRouter();
  const isEdit = !!id;

  const { data: clients } = trpc.clients.list.useQuery({ pageSize: 100 });
  const { data: projects } = trpc.projects.list.useQuery({ pageSize: 100 });
  const { data: retainer, isLoading } = trpc.retainers.getById.useQuery({ id: id! }, { enabled: isEdit });

  const createMutation = trpc.retainers.create.useMutation({ onSuccess: () => router.push('/retainers') });
  const updateMutation = trpc.retainers.update.useMutation({ onSuccess: () => router.push(`/retainers/${id}`) });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { currency: 'ILS', type: 'project_retainer' },
  });

  useEffect(() => {
    if (retainer) {
      setValue('clientId', retainer.clientId);
      setValue('projectId', retainer.projectId ?? undefined);
      setValue('type', retainer.type as RetainerType);
      setValue('amount', retainer.amount);
      setValue('currency', retainer.currency);
      setValue('notes', retainer.notes ?? undefined);
    }
  }, [retainer, setValue]);

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
        <Link href="/retainers"><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-semibold">{isEdit ? 'עריכת מקדמה' : 'מקדמה חדשה'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>פרטי מקדמה</CardTitle></CardHeader>
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

              <div className="space-y-2">
                <Label htmlFor="type">סוג מקדמה *</Label>
                <Select value={watch('type')} onValueChange={(v) => setValue('type', v as RetainerType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project_retainer">מקדמת פרויקט</SelectItem>
                    <SelectItem value="general_retainer">מקדמה כללית</SelectItem>
                    <SelectItem value="deposit">פיקדון</SelectItem>
                    <SelectItem value="trust_account">חשבון נאמנות</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">סכום *</Label>
                <Input type="number" step="0.01" {...register('amount', { required: true, valueAsNumber: true })} />
                {errors.amount && <p className="text-sm text-destructive">שדה חובה</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea {...register('notes')} placeholder="הערות נוספות..." />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEdit ? 'שמור שינויים' : 'צור מקדמה'}
              </Button>
              <Link href="/retainers"><Button type="button" variant="outline">ביטול</Button></Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
