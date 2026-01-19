/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const meetingTypeLabels: Record<string, { label: string; color: string }> = {
  initial_consultation: { label: 'פגישת היכרות', color: 'bg-blue-100 text-blue-800' },
  design_review: { label: 'סקירת עיצוב', color: 'bg-purple-100 text-purple-800' },
  site_visit: { label: 'ביקור באתר', color: 'bg-green-100 text-green-800' },
  client_presentation: { label: 'מצגת ללקוח', color: 'bg-orange-100 text-orange-800' },
  internal: { label: 'פנימי', color: 'bg-gray-100 text-gray-800' },
  other: { label: 'אחר', color: 'bg-gray-100 text-gray-800' },
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  scheduled: { label: 'מתוכנן', variant: 'outline' },
  confirmed: { label: 'מאושר', variant: 'default' },
  cancelled: { label: 'בוטל', variant: 'destructive' },
  completed: { label: 'הושלם', variant: 'secondary' },
  rescheduled: { label: 'נדחה', variant: 'outline' },
};

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function MeetingsContent() {
  const [view, setView] = useState<'today' | 'upcoming' | 'list'>('upcoming');

  const utils = trpc.useUtils();

  const { data: stats } = trpc.meetings.getStats.useQuery();
  const { data: todayMeetings, isLoading: todayLoading } = trpc.meetings.today.useQuery();
  const { data: upcomingMeetings, isLoading: upcomingLoading } = trpc.meetings.upcoming.useQuery();
  const { data: meetingsData, isLoading: listLoading } = trpc.meetings.list.useQuery({
    pageSize: 50,
  });

  const confirmMutation = trpc.meetings.confirm.useMutation({
    onSuccess: () => {
      utils.meetings.today.invalidate();
      utils.meetings.upcoming.invalidate();
      utils.meetings.list.invalidate();
    },
  });

  const cancelMutation = trpc.meetings.cancel.useMutation({
    onSuccess: () => {
      utils.meetings.today.invalidate();
      utils.meetings.upcoming.invalidate();
      utils.meetings.list.invalidate();
    },
  });

  const isLoading = view === 'today' ? todayLoading : view === 'upcoming' ? upcomingLoading : listLoading;
  const meetings = view === 'today'
    ? todayMeetings || []
    : view === 'upcoming'
      ? upcomingMeetings || []
      : meetingsData?.items || [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">פגישות</h1>
        <Link href="/meetings/new">
          <Button>+ פגישה חדשה</Button>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">סה״כ פגישות</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{stats.thisWeek}</div>
                <div className="text-sm text-muted-foreground">השבוע</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
                <div className="text-sm text-muted-foreground">קרובות</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {stats.byType.client_presentation || 0}
                </div>
                <div className="text-sm text-muted-foreground">מצגות</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* View Tabs */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Button
                variant={view === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('today')}
              >
                היום
              </Button>
              <Button
                variant={view === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('upcoming')}
              >
                קרובות
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
              >
                כל הפגישות
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Meetings List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {view === 'today' ? 'פגישות היום' : view === 'upcoming' ? 'פגישות קרובות' : 'כל הפגישות'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">טוען...</div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {view === 'today' ? 'אין פגישות היום' : 'אין פגישות להצגה'}
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map((meeting) => {
                  const typeInfo = meetingTypeLabels[meeting.meetingType] ?? { label: 'אחר', color: 'bg-gray-100 text-gray-800' };
                  const statusInfo = statusLabels[meeting.status] ?? { label: 'מתוכנן', variant: 'outline' as const };

                  return (
                    <div
                      key={meeting.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </div>

                          <Link href={`/meetings/${meeting.id}`} className="hover:underline">
                            <h3 className="font-medium">{meeting.title}</h3>
                          </Link>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                            <span>
                              {formatDate(meeting.startTime)}
                            </span>
                            <span>
                              {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                            </span>
                            {meeting.location && (
                              <span>📍 {meeting.location}</span>
                            )}
                          </div>

                          {(meeting.project || meeting.client) && (
                            <div className="flex gap-2 mt-2 text-sm">
                              {meeting.project && (
                                <span className="text-muted-foreground">
                                  פרויקט: {meeting.project.name}
                                </span>
                              )}
                              {meeting.client && (
                                <span className="text-muted-foreground">
                                  לקוח: {meeting.client.name}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {meeting.status === 'scheduled' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => confirmMutation.mutate({ id: meeting.id })}
                              disabled={confirmMutation.isPending}
                            >
                              אישור
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelMutation.mutate({ id: meeting.id })}
                              disabled={cancelMutation.isPending}
                            >
                              ביטול
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
    </>
  );
}
