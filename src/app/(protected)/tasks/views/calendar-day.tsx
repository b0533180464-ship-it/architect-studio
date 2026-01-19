/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import type { Route } from 'next';

interface Task {
  id: string;
  title: string;
  priority: string;
  computed: { isOverdue: boolean };
}

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-blue-400',
  high: 'bg-orange-400',
  urgent: 'bg-red-500',
};

export function CalendarDay({ date, tasks, isCurrentMonth, isToday }: CalendarDayProps) {
  const maxVisible = 3;
  const visibleTasks = tasks.slice(0, maxVisible);
  const remaining = tasks.length - maxVisible;

  return (
    <div
      className={`min-h-24 p-1 border rounded ${
        isCurrentMonth ? 'bg-background' : 'bg-muted/30'
      } ${isToday ? 'ring-2 ring-primary' : ''}`}
    >
      <div className={`text-sm mb-1 ${isCurrentMonth ? '' : 'text-muted-foreground'} ${isToday ? 'font-bold text-primary' : ''}`}>
        {date.getDate()}
      </div>
      <div className="space-y-0.5">
        {visibleTasks.map((task) => (
          <Link key={task.id} href={`/tasks/${task.id}` as Route}>
            <div
              className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 ${
                task.computed.isOverdue ? 'bg-destructive/20 text-destructive' : 'bg-muted'
              }`}
            >
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${priorityColors[task.priority] || 'bg-gray-400'}`} />
              {task.title}
            </div>
          </Link>
        ))}
        {remaining > 0 && (
          <div className="text-xs text-muted-foreground text-center">+{remaining} נוספות</div>
        )}
      </div>
    </div>
  );
}
