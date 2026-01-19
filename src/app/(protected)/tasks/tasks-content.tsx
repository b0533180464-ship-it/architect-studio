/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TaskKanban, TaskCalendar, TasksTable, ViewToggle, type TaskViewType, type TaskTableItem } from './views';

export function TasksContent() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'my' | 'overdue' | 'today'>('all');
  const [view, setView] = useState<TaskViewType>('table');
  const utils = trpc.useUtils();

  const { data: stats } = trpc.tasks.getStats.useQuery();
  const { data: tasksData, isLoading } = trpc.tasks.list.useQuery({
    search: search || undefined,
    dueDate: filter === 'overdue' ? 'overdue' : filter === 'today' ? 'today' : undefined,
    includeCompleted: false,
    pageSize: 100,
  });
  const { data: statusEntities } = trpc.config.list.useQuery({ entityType: 'task_status' });

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); },
  });

  const tasks = (tasksData?.items || []).map((t) => ({ ...t, computed: { ...t.computed, isOverdue: t.computed.isOverdue ?? false } }));
  const statuses = statusEntities || [];

  const handleUpdate = (id: string, field: string, value: unknown) => {
    updateMutation.mutate({ id, [field]: value });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">משימות</h1>
        <Link href="/tasks/new">
          <Button>+ משימה חדשה</Button>
        </Link>
      </div>

      <TaskStats stats={stats} />

        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                {(['all', 'my', 'today', 'overdue'] as const).map((f) => (
                  <Button key={f} variant={filter === f ? (f === 'overdue' ? 'destructive' : 'default') : 'outline'} size="sm" onClick={() => setFilter(f)}>
                    {f === 'all' ? 'הכל' : f === 'my' ? 'שלי' : f === 'today' ? 'היום' : 'באיחור'}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <Input placeholder="חיפוש משימות..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
                <ViewToggle view={view} onChange={setView} />
              </div>
            </div>
          </CardContent>
        </Card>

        {view === 'table' && (
          <Card>
            <CardHeader><CardTitle>טבלת משימות</CardTitle></CardHeader>
            <CardContent>
              <TasksTable
                tasks={tasks as TaskTableItem[]}
                isLoading={isLoading}
                onUpdate={handleUpdate}
              />
            </CardContent>
          </Card>
        )}

      {view === 'kanban' && <TaskKanban tasks={tasks} statuses={statuses} />}
      {view === 'calendar' && <TaskCalendar tasks={tasks} />}
    </>
  );
}

function TaskStats({ stats }: { stats?: { pending: number; myTasks: number; dueToday: number; overdue: number; completed: number } }) {
  if (!stats) return null;
  return (
    <div className="grid gap-4 md:grid-cols-5 mb-6">
      <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.pending}</div><div className="text-sm text-muted-foreground">פתוחות</div></CardContent></Card>
      <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.myTasks}</div><div className="text-sm text-muted-foreground">שלי</div></CardContent></Card>
      <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.dueToday}</div><div className="text-sm text-muted-foreground">היום</div></CardContent></Card>
      <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-destructive">{stats.overdue}</div><div className="text-sm text-muted-foreground">באיחור</div></CardContent></Card>
      <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">{stats.completed}</div><div className="text-sm text-muted-foreground">הושלמו</div></CardContent></Card>
    </div>
  );
}
