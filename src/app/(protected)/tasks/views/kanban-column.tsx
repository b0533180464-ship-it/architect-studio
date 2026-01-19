'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanTask } from './kanban-task';

interface Task {
  id: string;
  title: string;
  priority: string;
  dueDate: Date | null;
  project?: { id: string; name: string } | null;
  assignedTo?: { id: string; firstName: string; lastName: string } | null;
  taskStatus?: { id: string; name: string; color: string | null } | null;
  computed: { isOverdue: boolean };
}

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string | null;
  tasks: Task[];
  count: number;
}

export function KanbanColumn({ id, title, color, tasks, count }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-muted/50 rounded-lg p-3 transition-colors ${isOver ? 'bg-muted' : ''}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color || '#6B7280' }} />
        <h3 className="font-medium text-sm flex-1">{title}</h3>
        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">{count}</span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[100px]">
          {tasks.map((task) => (
            <KanbanTask key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">גרור משימות לכאן</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
