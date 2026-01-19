/* eslint-disable max-lines-per-function */
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Badge } from '@/components/ui/badge';
import { MEETING_TYPE_COLORS, MEETING_TYPE_LABELS, formatTime } from '../utils/meeting-colors';

interface Meeting {
  id: string;
  title: string;
  meetingType: string;
  status: string;
  startTime: Date;
  endTime: Date;
  location?: string | null;
  project?: { name: string } | null;
  client?: { name: string } | null;
}

interface AgendaViewProps {
  meetings: Meeting[];
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  scheduled: 'outline',
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'secondary',
};

export function AgendaView({ meetings }: AgendaViewProps) {
  const groupedMeetings = useMemo(() => {
    const groups: Record<string, Meeting[]> = {};
    const sorted = [...meetings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    sorted.forEach((m) => {
      const date = new Date(m.startTime).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(m);
    });
    return groups;
  }, [meetings]);

  if (meetings.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">אין פגישות להצגה</div>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedMeetings).map(([date, dayMeetings]) => (
        <div key={date} className="bg-card border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-2 font-medium">{date}</div>
          <div className="divide-y">
            {dayMeetings.map((m) => {
              const colors = MEETING_TYPE_COLORS[m.meetingType] ?? MEETING_TYPE_COLORS.other!;
              return (
                <Link key={m.id} href={`/meetings/${m.id}` as Route}>
                  <div className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {MEETING_TYPE_LABELS[m.meetingType] || 'אחר'}
                          </span>
                          <Badge variant={statusVariants[m.status] || 'outline'}>
                            {m.status === 'scheduled' ? 'מתוכנן' : m.status === 'confirmed' ? 'מאושר' : m.status === 'cancelled' ? 'בוטל' : 'הושלם'}
                          </Badge>
                        </div>
                        <h3 className="font-medium">{m.title}</h3>
                        <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-4">
                          <span>{formatTime(m.startTime)} - {formatTime(m.endTime)}</span>
                          {m.location && <span>📍 {m.location}</span>}
                          {m.project && <span>פרויקט: {m.project.name}</span>}
                          {m.client && <span>לקוח: {m.client.name}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
