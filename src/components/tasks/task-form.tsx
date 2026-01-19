/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfigSelect } from '@/components/ui/config-select';

interface Task {
  id: string;
  title: string;
  description: string | null;
  statusId: string | null;
  categoryId: string | null;
  priority: string;
  dueDate: Date | null;
  projectId: string | null;
}

interface TaskFormProps {
  task?: Task;
  projectId?: string;
  onSuccess?: () => void;
}

export function TaskForm({ task, projectId, onSuccess }: TaskFormProps) {
  const isEdit = !!task;
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    statusId: task?.statusId || '',
    categoryId: task?.categoryId || '',
    priority: (task?.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    projectId: task?.projectId || projectId || '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        statusId: task.statusId || '',
        categoryId: task.categoryId || '',
        priority: (task.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        projectId: task.projectId || projectId || '',
      });
    }
  }, [task, projectId]);

  const { data: projects } = trpc.projects.list.useQuery({ pageSize: 100 });

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.getStats.invalidate();
      onSuccess?.();
    },
  });

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.getStats.invalidate();
      if (task) utils.tasks.getById.invalidate({ id: task.id });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      statusId: formData.statusId || undefined,
      categoryId: formData.categoryId || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      projectId: formData.projectId || undefined,
    };

    if (isEdit && task) {
      updateMutation.mutate({ id: task.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">כותרת *</Label>
        <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="שם המשימה" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">תיאור</Label>
        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="פרטי המשימה" rows={3} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>סטטוס</Label>
          <ConfigSelect entityType="task_status" value={formData.statusId} onChange={(v) => setFormData({ ...formData, statusId: v })} placeholder="בחר סטטוס" />
        </div>
        <div className="space-y-2">
          <Label>קטגוריה</Label>
          <ConfigSelect entityType="task_category" value={formData.categoryId} onChange={(v) => setFormData({ ...formData, categoryId: v })} placeholder="בחר קטגוריה" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>עדיפות</Label>
          <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as 'low' | 'medium' | 'high' | 'urgent' })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">נמוכה</SelectItem>
              <SelectItem value="medium">בינונית</SelectItem>
              <SelectItem value="high">גבוהה</SelectItem>
              <SelectItem value="urgent">דחוף</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">תאריך יעד</Label>
          <Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
        </div>
      </div>

      {!projectId && (
        <div className="space-y-2">
          <Label>פרויקט</Label>
          <Select value={formData.projectId} onValueChange={(v) => setFormData({ ...formData, projectId: v })}>
            <SelectTrigger><SelectValue placeholder="בחר פרויקט (אופציונלי)" /></SelectTrigger>
            <SelectContent>
              {projects?.items.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור משימה'}
        </Button>
      </div>
    </form>
  );
}
