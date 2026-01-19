/* eslint-disable max-lines-per-function, complexity */
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

interface FormData {
  clientId: string;
  projectId: string;
  title: string;
  content: string;
  totalValue: number;
  startDate: string;
  endDate?: string;
}

export function ContractFormContent({ id }: { id?: string }) {
  const router = useRouter();
  const isEdit = !!id;

  const { data: clients } = trpc.clients.list.useQuery({ pageSize: 100 });
  const { data: projects } = trpc.projects.list.useQuery({ pageSize: 100 });
  const { data: contract, isLoading } = trpc.contracts.getById.useQuery({ id: id! }, { enabled: isEdit });

  const createMutation = trpc.contracts.create.useMutation({ onSuccess: (data) => router.push(`/contracts/${data.id}`) });
  const updateMutation = trpc.contracts.update.useMutation({ onSuccess: () => router.push(`/contracts/${id}`) });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { startDate: new Date().toISOString().split('T')[0] },
  });

  useEffect(() => {
    if (contract) {
      setValue('clientId', contract.clientId);
      setValue('projectId', contract.projectId);
      setValue('title', contract.title);
      setValue('content', contract.content ?? '');
      setValue('totalValue', contract.totalValue);
      setValue('startDate', new Date(contract.startDate).toISOString().split('T')[0] ?? '');
      setValue('endDate', contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : undefined);
    }
  }, [contract, setValue]);

  const onSubmit = (data: FormData) => {
    if (isEdit && id) {
      updateMutation.mutate({ id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isLoading) return <div className="text-center py-8 text-muted-foreground">טוען...</div>;

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/contracts"><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-semibold">{isEdit ? 'עריכת חוזה' : 'חוזה חדש'}</h1>
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
                <Label htmlFor="projectId">פרויקט *</Label>
                <Select value={watch('projectId')} onValueChange={(v) => setValue('projectId', v)}>
                  <SelectTrigger><SelectValue placeholder="בחר פרויקט" /></SelectTrigger>
                  <SelectContent>
                    {projects?.items.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.projectId && <p className="text-sm text-destructive">שדה חובה</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">כותרת החוזה *</Label>
              <Input {...register('title', { required: true })} placeholder="חוזה לפרויקט..." />
              {errors.title && <p className="text-sm text-destructive">שדה חובה</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="totalValue">ערך החוזה *</Label>
                <Input type="number" step="0.01" {...register('totalValue', { required: true, valueAsNumber: true })} />
                {errors.totalValue && <p className="text-sm text-destructive">שדה חובה</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">תאריך התחלה *</Label>
                <Input type="date" {...register('startDate', { required: true })} />
                {errors.startDate && <p className="text-sm text-destructive">שדה חובה</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">תאריך סיום</Label>
                <Input type="date" {...register('endDate')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>תוכן החוזה</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="content">תוכן *</Label>
              <Textarea {...register('content', { required: true })} placeholder="תוכן החוזה..." rows={10} />
              {errors.content && <p className="text-sm text-destructive">שדה חובה</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'שמור שינויים' : 'צור חוזה'}
          </Button>
          <Link href="/contracts"><Button type="button" variant="outline">ביטול</Button></Link>
        </div>
      </form>
    </>
  );
}
