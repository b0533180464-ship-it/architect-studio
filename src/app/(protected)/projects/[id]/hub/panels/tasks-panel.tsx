/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExpandablePanel } from '@/components/projects/hub/expandable-panel';

interface TasksPanelProps {
  projectId: string;
}

export function ProjectTasksPanel({ projectId }: TasksPanelProps) {
  const { data } = trpc.tasks.list.useQuery({ projectId, pageSize: 5 });

  const tasks = data?.items || [];
  const total = data?.pagination.total || 0;

  return (
    <ExpandablePanel id="tasks" title="משימות" icon="✅" count={total} projectId={projectId}>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">אין משימות</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className={task.taskStatus?.code === 'done' ? 'line-through text-muted-foreground' : ''}>
                  {task.title}
                </span>
              </div>
              {task.taskStatus && (
                <Badge variant="secondary" style={{ backgroundColor: task.taskStatus.color || undefined }}>
                  {task.taskStatus.name}
                </Badge>
              )}
            </div>
          ))}
          {total > 5 && (
            <div className="pt-2 border-t">
              <Link href={`/tasks?projectId=${projectId}`}>
                <Button variant="ghost" size="sm" className="w-full">
                  צפה בכל {total} המשימות &larr;
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </ExpandablePanel>
  );
}
