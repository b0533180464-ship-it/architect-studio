'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TextCell, SelectCell, ConfigSelectCell, DateCell, TextareaCell } from '@/components/data-table/cells';
import { priorityOptions, type TaskTableItem } from './tasks-columns';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';

interface TaskTableRowProps {
  task: TaskTableItem;
  onUpdate: (field: string, value: unknown) => void;
  onClick?: () => void;
  onDelete?: () => void;
}

/**
 * שורת משימה בטבלה
 */
export function TaskTableRow({ task, onUpdate, onClick, onDelete }: TaskTableRowProps) {
  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <TitleCell task={task} onUpdate={onUpdate} onClick={onClick} />
      <StatusCell task={task} onUpdate={onUpdate} />
      <PriorityCell task={task} onUpdate={onUpdate} />
      <DueDateCell task={task} onUpdate={onUpdate} />
      <CategoryCell task={task} onUpdate={onUpdate} />
      <ProjectCell task={task} onUpdate={onUpdate} />
      <DescriptionCell task={task} onUpdate={onUpdate} />
      <ActionsCell onDelete={onDelete} taskId={task.id} />
    </tr>
  );
}

function TitleCell({ task, onUpdate, onClick }: { task: TaskTableItem; onUpdate: (f: string, v: unknown) => void; onClick?: () => void }) {
  return (
    <td className="py-2 px-2 border-l border-border/50 sticky right-0 z-10 bg-background shadow-[-2px_0_5px_rgba(0,0,0,0.05)]" style={{ minWidth: 200 }}>
      <div onClick={onClick} className={cn(onClick && 'cursor-pointer')}>
        <TextCell value={task.title} onSave={(v) => onUpdate('title', v)} placeholder="הזן כותרת..." />
      </div>
    </td>
  );
}

function StatusCell({ task, onUpdate }: { task: TaskTableItem; onUpdate: (f: string, v: unknown) => void }) {
  return (
    <td className="py-2 px-2 border-l border-border/50" style={{ width: 130 }}>
      <ConfigSelectCell value={task.statusId} onSave={(v) => onUpdate('statusId', v)} entityType="task_status" placeholder="סטטוס" allowEmpty />
    </td>
  );
}

function PriorityCell({ task, onUpdate }: { task: TaskTableItem; onUpdate: (f: string, v: unknown) => void }) {
  return (
    <td className="py-2 px-2 border-l border-border/50" style={{ width: 110 }}>
      <SelectCell value={task.priority} onSave={(v) => onUpdate('priority', v)} options={priorityOptions} placeholder="עדיפות" />
    </td>
  );
}

function DueDateCell({ task, onUpdate }: { task: TaskTableItem; onUpdate: (f: string, v: unknown) => void }) {
  return (
    <td className="py-2 px-2 border-l border-border/50" style={{ width: 120 }}>
      <DateCell value={task.dueDate} onSave={(v) => onUpdate('dueDate', v)} placeholder="תאריך יעד" />
    </td>
  );
}

function CategoryCell({ task, onUpdate }: { task: TaskTableItem; onUpdate: (f: string, v: unknown) => void }) {
  return (
    <td className="py-2 px-2 border-l border-border/50" style={{ width: 130 }}>
      <ConfigSelectCell value={task.categoryId} onSave={(v) => onUpdate('categoryId', v)} entityType="task_category" placeholder="קטגוריה" allowEmpty />
    </td>
  );
}

function ProjectCell({ task, onUpdate }: { task: TaskTableItem; onUpdate: (f: string, v: unknown) => void }) {
  const { data: projects } = trpc.projects.list.useQuery({ pageSize: 100 });
  const options = (projects?.items || []).map((p) => ({ value: p.id, label: p.name }));

  return (
    <td className="py-2 px-2 border-l border-border/50" style={{ width: 150 }}>
      <SelectCell value={task.projectId} onSave={(v) => onUpdate('projectId', v)} options={options} placeholder="פרויקט" allowEmpty />
    </td>
  );
}

function DescriptionCell({ task, onUpdate }: { task: TaskTableItem; onUpdate: (f: string, v: unknown) => void }) {
  return (
    <td className="py-2 px-2 border-l border-border/50" style={{ width: 60 }}>
      <TextareaCell value={task.description} onSave={(v) => onUpdate('description', v)} placeholder="תיאור..." />
    </td>
  );
}

function ActionsCell({ onDelete, taskId }: { onDelete?: () => void; taskId: string }) {
  return (
    <td className="py-2 px-1 w-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild><a href={`/tasks/${taskId}`}>פתח בדף מלא</a></DropdownMenuItem>
          {onDelete && <DropdownMenuItem onClick={onDelete} className="text-destructive">מחק</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}
