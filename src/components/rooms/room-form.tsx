/* eslint-disable max-lines-per-function, complexity, max-lines */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfigSelect } from '@/components/ui/config-select';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(1, 'שם החדר הוא שדה חובה'),
  typeId: z.string().optional(),
  statusId: z.string().optional(),
  area: z.coerce.number().positive().optional().or(z.literal('')),
  budget: z.coerce.number().nonnegative().optional().or(z.literal('')),
  designStatus: z.enum(['not_started', 'concept', 'detailed', 'approved', 'in_progress', 'completed']),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface RoomForEdit {
  id: string;
  name: string;
  typeId: string | null;
  statusId: string | null;
  area: number | null;
  budget: number | null;
  designStatus: string;
  notes: string | null;
}

interface RoomFormProps {
  projectId: string;
  room?: RoomForEdit;
  onSuccess?: () => void;
}

export function RoomForm({ projectId, room, onSuccess }: RoomFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const isEdit = !!room;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: room?.name || '',
      typeId: room?.typeId || undefined,
      statusId: room?.statusId || undefined,
      area: room?.area || '',
      budget: room?.budget || '',
      designStatus: room?.designStatus as FormData['designStatus'] || 'not_started',
      notes: room?.notes || '',
    },
  });

  const createMutation = trpc.rooms.create.useMutation({
    onSuccess: () => {
      void utils.rooms.list.invalidate({ projectId });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/projects/${projectId}`);
      }
    },
  });

  const updateMutation = trpc.rooms.update.useMutation({
    onSuccess: () => {
      void utils.rooms.list.invalidate({ projectId });
      void utils.rooms.getById.invalidate({ id: room!.id });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/projects/${projectId}`);
      }
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: FormData) => {
    const payload = {
      name: data.name,
      typeId: data.typeId || undefined,
      statusId: data.statusId || undefined,
      area: data.area ? Number(data.area) : undefined,
      budget: data.budget ? Number(data.budget) : undefined,
      designStatus: data.designStatus,
      notes: data.notes || undefined,
    };

    if (isEdit) {
      updateMutation.mutate({ id: room.id, ...payload });
    } else {
      createMutation.mutate({ projectId, ...payload });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">שם החדר *</Label>
          <Input id="name" {...form.register('name')} placeholder="סלון" />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>סוג חדר</Label>
          <ConfigSelect
            entityType="room_type"
            value={form.watch('typeId') || ''}
            onChange={(value) => form.setValue('typeId', value || undefined)}
            placeholder="בחר סוג חדר..."
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="area">שטח (מ״ר)</Label>
          <Input id="area" type="number" step="0.1" {...form.register('area')} placeholder="25" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">תקציב (₪)</Label>
          <Input id="budget" type="number" {...form.register('budget')} placeholder="50000" />
        </div>

        <div className="space-y-2">
          <Label>סטטוס תכנון</Label>
          <ConfigSelect
            entityType="room_status"
            value={form.watch('statusId') || ''}
            onChange={(value) => form.setValue('statusId', value || undefined)}
            placeholder="בחר סטטוס..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">הערות</Label>
        <Textarea id="notes" {...form.register('notes')} placeholder="הערות נוספות..." rows={3} />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          ביטול
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור חדר'}
        </Button>
      </div>
    </form>
  );
}
