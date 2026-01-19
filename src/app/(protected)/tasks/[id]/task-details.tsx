/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfigBadge } from '@/components/ui/config-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';

const priorityLabels: Record<string, { label: string; variant: 'secondary' | 'outline' | 'warning' | 'destructive' }> = {
  low: { label: 'נמוכה', variant: 'secondary' },
  medium: { label: 'בינונית', variant: 'outline' },
  high: { label: 'גבוהה', variant: 'warning' },
  urgent: { label: 'דחוף', variant: 'destructive' },
};

function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function TaskDetails({ taskId }: { taskId: string }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const utils = trpc.useUtils();
  const { data: task, isLoading } = trpc.tasks.getById.useQuery({ id: taskId });

  const completeMutation = trpc.tasks.complete.useMutation({
    onSuccess: () => utils.tasks.getById.invalidate({ id: taskId }),
  });

  const reopenMutation = trpc.tasks.reopen.useMutation({
    onSuccess: () => utils.tasks.getById.invalidate({ id: taskId }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">טוען...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">משימה לא נמצאה</p>
      </div>
    );
  }

  const priorityInfo = priorityLabels[task.priority] ?? { label: 'בינונית', variant: 'outline' as const };
  const isCompleted = task.completedAt !== null;
  const checklist = (task.checklist as Array<{ title: string; completed: boolean }> | null) || [];
  const checklistProgress = checklist.length > 0 ? Math.round((checklist.filter(item => item.completed).length / checklist.length) * 100) : 0;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">פרטי משימה</h1>
        <div className="flex gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">עריכה</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle>עריכת משימה</DialogTitle>
              </DialogHeader>
              <TaskForm task={task} onSuccess={() => setIsEditOpen(false)} />
            </DialogContent>
          </Dialog>
          {!isCompleted ? (
            <Button onClick={() => completeMutation.mutate({ id: taskId })} disabled={completeMutation.isPending}>סמן כהושלם</Button>
          ) : (
            <Button variant="outline" onClick={() => reopenMutation.mutate({ id: taskId })} disabled={reopenMutation.isPending}>פתח מחדש</Button>
          )}
        </div>
      </div>

      <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <ConfigBadge entity={task.taskStatus} />
                <ConfigBadge entity={task.taskCategory} />
                <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>
                {isCompleted && <Badge variant="secondary">הושלם</Badge>}
                {task.computed.isOverdue && !isCompleted && <Badge variant="destructive">באיחור</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {task.description && (
              <div>
                <h3 className="font-medium mb-2">תיאור</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {task.dueDate && (
                <div>
                  <h3 className="font-medium mb-1">תאריך יעד</h3>
                  <p className={task.computed.isOverdue ? 'text-destructive' : 'text-muted-foreground'}>{formatDate(task.dueDate)}</p>
                </div>
              )}
              {task.project && (
                <div>
                  <h3 className="font-medium mb-1">פרויקט</h3>
                  <p className="text-muted-foreground">{task.project.name}</p>
                </div>
              )}
              {task.assignedTo && (
                <div>
                  <h3 className="font-medium mb-1">אחראי</h3>
                  <p className="text-muted-foreground">{task.assignedTo.firstName} {task.assignedTo.lastName}</p>
                </div>
              )}
              {task.createdBy && (
                <div>
                  <h3 className="font-medium mb-1">נוצר על ידי</h3>
                  <p className="text-muted-foreground">{task.createdBy.firstName} {task.createdBy.lastName}</p>
                </div>
              )}
            </div>

            {checklist.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">צ׳קליסט ({checklistProgress}%)</h3>
                <div className="space-y-2">
                  {checklist.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                        {item.completed ? '✓' : '○'} {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </>
  );
}
