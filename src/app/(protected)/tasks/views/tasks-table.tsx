'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { TableSkeleton, TableEmptyState, EntitySheet } from '@/components/data-table';
import { tasksColumns, priorityOptions, type TaskTableItem } from './tasks-columns';
import { TaskTableRow } from './task-table-row';

interface TasksTableProps {
  tasks: TaskTableItem[];
  isLoading?: boolean;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onDelete?: (id: string) => void;
}

/**
 * טבלת משימות עם עריכה inline
 */
export function TasksTable({ tasks, isLoading, onUpdate, onDelete }: TasksTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) return <TableSkeleton columns={tasksColumns.length} />;
  if (tasks.length === 0) return <TableEmptyState message="אין משימות להצגה" />;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse" dir="rtl">
          <TaskTableHeader />
          <tbody>
            {tasks.map((task) => (
              <TaskTableRow
                key={task.id}
                task={task}
                onUpdate={(field, value) => onUpdate(task.id, field, value)}
                onClick={() => setSelectedId(task.id)}
                onDelete={onDelete ? () => onDelete(task.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      </div>
      <TaskDetailSheet taskId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

function TaskTableHeader() {
  return (
    <thead className="sticky top-0 z-10">
      <tr>
        {tasksColumns.map((col) => (
          <th key={col.key} style={{ width: col.width, minWidth: col.minWidth }} className="py-3 px-2 text-right text-sm font-medium text-muted-foreground border-l border-border/50 bg-muted/30">
            {col.label}{col.required && <span className="text-destructive">*</span>}
          </th>
        ))}
        <th className="py-3 px-2 w-10 bg-muted/30 border-l border-border/50" />
      </tr>
    </thead>
  );
}

function TaskDetailSheet({ taskId, onClose }: { taskId: string | null; onClose: () => void }) {
  const { data: task } = trpc.tasks.getById.useQuery({ id: taskId! }, { enabled: !!taskId });

  if (!taskId) return null;

  return (
    <EntitySheet open={!!taskId} onOpenChange={(open) => !open && onClose()} title={task?.title || 'פרטי משימה'} detailUrl={`/tasks/${taskId}`}>
      <div className="space-y-4">
        {task && (
          <>
            <div><span className="text-muted-foreground">כותרת:</span> {task.title}</div>
            <div><span className="text-muted-foreground">תיאור:</span> {task.description || '-'}</div>
            <div><span className="text-muted-foreground">עדיפות:</span> {priorityOptions.find((o) => o.value === task.priority)?.label}</div>
          </>
        )}
      </div>
    </EntitySheet>
  );
}

export { tasksColumns, priorityOptions };
