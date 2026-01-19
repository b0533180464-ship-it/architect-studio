/* eslint-disable max-lines-per-function */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ConfigSelect } from '@/components/ui/config-select';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import type { RouterOutputs } from '@/lib/trpc';

const formSchema = z.object({
  name: z.string().min(1, 'שם המסמך הוא שדה חובה'),
  type: z.string().optional(),
  categoryId: z.string().optional(),
  isSharedWithClient: z.boolean(),
  clientCanDownload: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

type Document = RouterOutputs['documents']['getById'];

interface DocumentFormProps {
  document: Document;
  onSuccess?: () => void;
}

export function DocumentForm({ document, onSuccess }: DocumentFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: document.name,
      type: document.type || '',
      categoryId: document.categoryId || undefined,
      isSharedWithClient: document.isSharedWithClient,
      clientCanDownload: document.clientCanDownload,
    },
  });

  const updateMutation = trpc.documents.update.useMutation({
    onSuccess: () => {
      void utils.documents.list.invalidate();
      void utils.documents.getById.invalidate({ id: document.id });
      onSuccess?.();
      router.back();
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({
      id: document.id,
      name: data.name,
      type: data.type || undefined,
      categoryId: data.categoryId || null,
      isSharedWithClient: data.isSharedWithClient,
      clientCanDownload: data.clientCanDownload,
    });
  };

  const watchShared = form.watch('isSharedWithClient');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">שם המסמך *</Label>
          <Input id="name" {...form.register('name')} placeholder="שם הקובץ" />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">סוג</Label>
          <Input id="type" {...form.register('type')} placeholder="תוכנית / רנדר / חוזה" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>קטגוריה</Label>
        <ConfigSelect
          entityType="document_category"
          value={form.watch('categoryId') || ''}
          onChange={(value) => form.setValue('categoryId', value || undefined)}
          placeholder="בחר קטגוריה..."
        />
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-medium">שיתוף עם לקוח</h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="isSharedWithClient">שתף עם לקוח</Label>
            <p className="text-sm text-muted-foreground">המסמך יהיה גלוי בפורטל הלקוח</p>
          </div>
          <Switch
            id="isSharedWithClient"
            checked={form.watch('isSharedWithClient')}
            onCheckedChange={(checked: boolean) => {
              form.setValue('isSharedWithClient', checked);
              if (!checked) {
                form.setValue('clientCanDownload', false);
              }
            }}
          />
        </div>

        {watchShared && (
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="clientCanDownload">אפשר הורדה</Label>
              <p className="text-sm text-muted-foreground">הלקוח יוכל להוריד את הקובץ</p>
            </div>
            <Switch
              id="clientCanDownload"
              checked={form.watch('clientCanDownload')}
              onCheckedChange={(checked: boolean) => form.setValue('clientCanDownload', checked)}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={updateMutation.isPending}>
          ביטול
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'שומר...' : 'שמור שינויים'}
        </Button>
      </div>
    </form>
  );
}
