/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { trpc } from '@/lib/trpc';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';

interface Task {
  id: string;
  title: string;
  priority: string;
  dueDate: Date | null;
  statusId: string | null;
  project?: { id: string; name: string } | null;
  assignedTo?: { id: string; firstName: string; lastName: string } | null;
  taskStatus?: { id: string; name: string; color: string | null } | null;
  computed: { isOverdue: boolean };
}

interface TaskKanbanProps {
  tasks: Task[];
  statuses: { id: string; name: string; color: string | null }[];
}

export function TaskKanban({ tasks, statuses }: TaskKanbanProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.getStats.invalidate();
    },
  });

  const tasksByStatus = statuses.reduce((acc, status) => {
    acc[status.id] = tasks.filter((t) => t.statusId === status.id);
    return acc;
  }, {} as Record<string, Task[]>);

  // Add unassigned column for tasks without status
  const unassignedTasks = tasks.filter((t) => !t.statusId);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatusId = over.id as string;
    const task = tasks.find((t) => t.id === taskId);

    if (task && task.statusId !== newStatusId) {
      updateStatusMutation.mutate({ id: taskId, statusId: newStatusId });
    }
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {statuses.map((status) => (
          <KanbanColumn
            key={status.id}
            id={status.id}
            title={status.name}
            color={status.color}
            tasks={tasksByStatus[status.id] || []}
            count={(tasksByStatus[status.id] || []).length}
          />
        ))}
        {unassignedTasks.length > 0 && (
          <KanbanColumn
            id="unassigned"
            title="ללא סטטוס"
            color="#6B7280"
            tasks={unassignedTasks}
            count={unassignedTasks.length}
          />
        )}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} isCompact />}
      </DragOverlay>
    </DndContext>
  );
}
