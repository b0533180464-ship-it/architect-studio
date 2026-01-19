/* eslint-disable max-lines-per-function, max-lines */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckSquare } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfigBadge } from '@/components/ui/config-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';

interface ProjectTasksProps {
  projectId: string;
}

const priorityLabels: Record<string, { label: string; variant: 'secondary' | 'outline' | 'warning' | 'destructive' }> = {
  low: { label: 'נמוכה', variant: 'secondary' },
  medium: { label: 'בינונית', variant: 'outline' },
  high: { label: 'גבוהה', variant: 'warning' },
  urgent: { label: 'דחוף', variant: 'destructive' },
};

function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });
}

interface TaskForEdit {
  id: string;
  title: string;
  description: string | null;
  statusId: string | null;
  categoryId: string | null;
  priority: string;
  dueDate: Date | null;
  projectId: string | null;
}

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskForEdit | null>(null);

  const { data: tasksData, isLoading } = trpc.tasks.list.useQuery({
    projectId,
    pageSize: 50,
  });

  const tasks = tasksData?.items || [];
  const pendingTasks = tasks.filter((t) => !t.completedAt);
  const completedTasks = tasks.filter((t) => t.completedAt);

  return (
    <Card size="xl" className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>משימות ({tasks.length})</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">הוסף משימה</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>משימה חדשה</DialogTitle>
            </DialogHeader>
            <TaskForm projectId={projectId} onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">טוען...</div>
        ) : tasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <CheckSquare className="mb-2 h-8 w-8 opacity-50" />
            <p>אין משימות לפרויקט זה</p>
            <p className="text-sm mt-1">לחץ על &quot;הוסף משימה&quot; ליצירת משימה חדשה</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTasks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">פתוחות ({pendingTasks.length})</h4>
                <div className="space-y-2">
                  {pendingTasks.map((task) => {
                    const priorityInfo = priorityLabels[task.priority] ?? { label: 'בינונית', variant: 'outline' as const };
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Link href={`/tasks/${task.id}`} className="hover:underline font-medium truncate">
                            {task.title}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <ConfigBadge entity={task.taskStatus} size="sm" />
                          <Badge variant={priorityInfo.variant} className="text-xs">{priorityInfo.label}</Badge>
                          {task.dueDate && (
                            <span className={`text-xs ${task.computed.isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => setEditingTask({
                              id: task.id,
                              title: task.title,
                              description: task.description,
                              statusId: task.statusId,
                              categoryId: task.categoryId,
                              priority: task.priority,
                              dueDate: task.dueDate,
                              projectId: task.projectId,
                            })}
                          >
                            עריכה
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">הושלמו ({completedTasks.length})</h4>
                <div className="space-y-2">
                  {completedTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <Link href={`/tasks/${task.id}`} className="hover:underline text-muted-foreground line-through truncate">
                        {task.title}
                      </Link>
                      <Badge variant="secondary" className="text-xs">הושלם</Badge>
                    </div>
                  ))}
                  {completedTasks.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{completedTasks.length - 5} משימות נוספות
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת משימה</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm task={editingTask} onSuccess={() => setEditingTask(null)} />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
