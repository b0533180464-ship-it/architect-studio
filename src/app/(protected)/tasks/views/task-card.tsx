/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Route } from 'next';

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

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    priority: string;
    dueDate: Date | null;
    project?: { id: string; name: string } | null;
    assignedTo?: { id: string; firstName: string; lastName: string } | null;
    taskStatus?: { id: string; name: string; color: string | null } | null;
    computed: { isOverdue: boolean };
  };
  onComplete?: (id: string) => void;
  isCompact?: boolean;
}

export function TaskCard({ task, onComplete, isCompact }: TaskCardProps) {
  return (
    <div className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2">
        {onComplete && (
          <button
            className="mt-1 w-4 h-4 rounded border-2 border-muted-foreground/50 hover:border-primary flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
          />
        )}
        <div className="flex-1 min-w-0">
          <Link href={`/tasks/${task.id}` as Route} className="hover:underline">
            <p className={`font-medium truncate ${isCompact ? 'text-sm' : ''}`}>{task.title}</p>
          </Link>
          {!isCompact && task.project && (
            <p className="text-xs text-muted-foreground truncate mt-1">{task.project.name}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {task.dueDate && (
          <span className={`text-xs ${task.computed.isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
            {formatDate(task.dueDate)}
          </span>
        )}
        <Badge variant={priorityLabels[task.priority]?.variant || 'outline'} className="text-xs">
          {priorityLabels[task.priority]?.label || task.priority}
        </Badge>
        {task.assignedTo && (
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
            {task.assignedTo.firstName[0]}{task.assignedTo.lastName[0]}
          </div>
        )}
      </div>
    </div>
  );
}
