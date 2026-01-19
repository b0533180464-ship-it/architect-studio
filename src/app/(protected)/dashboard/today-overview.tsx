/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import { CheckCircle2, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';

const priorityLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'warning' }> = {
  low: { label: 'נמוכה', variant: 'secondary' },
  medium: { label: 'בינונית', variant: 'outline' },
  high: { label: 'גבוהה', variant: 'warning' },
  urgent: { label: 'דחוף', variant: 'destructive' },
};

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

function TodayTasksCard() {
  const { data: todayTasks, isLoading } = trpc.tasks.today.useQuery();

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2">
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="font-semibold text-slate-900">משימות להיום</h3>
        </div>
        <Link
          href="/tasks?filter=today"
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
        >
          הכל
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : !todayTasks || todayTasks.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">אין משימות להיום</p>
        ) : (
          <TasksList tasks={todayTasks} />
        )}
      </div>
    </div>
  );
}

function TasksList({ tasks }: { tasks: { id: string; title: string; priority: string }[] }) {
  return (
    <div className="space-y-2">
      {tasks.slice(0, 5).map((task) => {
        const priorityInfo = priorityLabels[task.priority] ?? priorityLabels.medium;
        return (
          <Link
            key={task.id}
            href={`/tasks/${task.id}`}
            className="flex items-center justify-between gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
          >
            <span className="flex-1 truncate text-sm font-medium text-slate-700">{task.title}</span>
            <Badge variant={priorityInfo?.variant || 'outline'} className="shrink-0">
              {priorityInfo?.label || task.priority}
            </Badge>
          </Link>
        );
      })}
      {tasks.length > 5 && (
        <p className="pt-2 text-center text-xs text-slate-500">+ {tasks.length - 5} משימות נוספות</p>
      )}
    </div>
  );
}

function TodayMeetingsCard() {
  const { data: todayMeetings, isLoading } = trpc.meetings.today.useQuery();

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2">
            <Calendar className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-slate-900">פגישות להיום</h3>
        </div>
        <Link
          href="/meetings?view=today"
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
        >
          הכל
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : !todayMeetings || todayMeetings.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">אין פגישות להיום</p>
        ) : (
          <MeetingsList meetings={todayMeetings} />
        )}
      </div>
    </div>
  );
}

function MeetingsList({ meetings }: { meetings: { id: string; title: string; startTime: Date }[] }) {
  return (
    <div className="space-y-2">
      {meetings.slice(0, 5).map((meeting) => (
        <Link
          key={meeting.id}
          href={`/meetings/${meeting.id}`}
          className="flex items-center justify-between gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
        >
          <span className="flex-1 truncate text-sm font-medium text-slate-700">{meeting.title}</span>
          <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600" dir="ltr">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(meeting.startTime)}
          </span>
        </Link>
      ))}
      {meetings.length > 5 && (
        <p className="pt-2 text-center text-xs text-slate-500">+ {meetings.length - 5} פגישות נוספות</p>
      )}
    </div>
  );
}

export function TodayOverview() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <TodayTasksCard />
      <TodayMeetingsCard />
    </div>
  );
}
