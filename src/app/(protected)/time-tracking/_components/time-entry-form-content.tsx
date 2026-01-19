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
  projectId: string;
  taskId?: string;
  date: string;
  hours: number;
  startTime?: string;
  endTime?: string;
  description?: string;
  isBillable: boolean;
  hourlyRate?: number;
}

export function TimeEntryFormContent({ id }: { id?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!id;
  const defaultProjectId = searchParams.get('projectId') || '';

  const { data: projects } = trpc.projects.list.useQuery({ pageSize: 100 });
  const { data: tasks } = trpc.tasks.list.useQuery({ pageSize: 100 });
  const { data: entry, isLoading } = trpc.timeEntries.getById.useQuery({ id: id! }, { enabled: isEdit });

  const createMutation = trpc.timeEntries.create.useMutation({ onSuccess: (data) => router.push(`/time-tracking/${data.id}`) });
  const updateMutation = trpc.timeEntries.update.useMutation({ onSuccess: () => router.push(`/time-tracking/${id}`) });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { date: new Date().toISOString().split('T')[0], isBillable: true, hours: 1, projectId: defaultProjectId },
  });

  useEffect(() => {
    if (defaultProjectId && !isEdit) setValue('projectId', defaultProjectId);
  }, [defaultProjectId, isEdit, setValue]);

  useEffect(() => {
    if (entry) {
      setValue('projectId', entry.projectId);
      setValue('taskId', entry.taskId ?? undefined);
      setValue('date', new Date(entry.date).toISOString().split('T')[0] ?? '');
      setValue('hours', entry.hours);
      setValue('startTime', entry.startTime ?? undefined);
      setValue('endTime', entry.endTime ?? undefined);
      setValue('description', entry.description ?? undefined);
      setValue('isBillable', entry.isBillable);
      setValue('hourlyRate', entry.hourlyRate ?? undefined);
    }
  }, [entry, setValue]);

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
        <Link href="/time-tracking"><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-semibold">{isEdit ? 'עריכת רישום זמן' : 'רישום זמן חדש'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader><CardTitle>פרטי רישום</CardTitle></CardHeader>
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
                <Label htmlFor="taskId">משימה (אופציונלי)</Label>
                <Select value={watch('taskId') ?? '__none__'} onValueChange={(v) => setValue('taskId', v === '__none__' ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="בחר משימה" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">ללא משימה</SelectItem>
                    {tasks?.items.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="date">תאריך *</Label>
                <Input type="date" {...register('date', { required: true })} />
                {errors.date && <p className="text-sm text-destructive">שדה חובה</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">שעות *</Label>
                <Input type="number" step="0.25" {...register('hours', { required: true, valueAsNumber: true })} />
                {errors.hours && <p className="text-sm text-destructive">שדה חובה</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">שעת התחלה</Label>
                <Input type="time" {...register('startTime')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">שעת סיום</Label>
                <Input type="time" {...register('endTime')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea {...register('description')} placeholder="מה עשית?" />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="isBillable" checked={isBillable} onCheckedChange={(checked: boolean | 'indeterminate') => setValue('isBillable', checked === true)} />
              <Label htmlFor="isBillable" className="cursor-pointer">לחיוב</Label>
            </div>

            {isBillable && (
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">תעריף לשעה</Label>
                <Input type="number" step="0.01" {...register('hourlyRate', { valueAsNumber: true })} placeholder="0" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'שמור שינויים' : 'צור רישום'}
          </Button>
          <Link href="/time-tracking"><Button type="button" variant="outline">ביטול</Button></Link>
        </div>
      </form>
    </>
  );
}
