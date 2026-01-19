/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExpandablePanel } from '@/components/projects/hub/expandable-panel';

interface MeetingsPanelProps {
  projectId: string;
}

export function ProjectMeetingsPanel({ projectId }: MeetingsPanelProps) {
  const { data } = trpc.meetings.list.useQuery({ projectId, pageSize: 5 });

  const meetings = data?.items || [];
  const total = data?.pagination.total || 0;

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    return `${d.toLocaleDateString('he-IL')} ${d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const isPast = (date: Date) => new Date(date) < new Date();

  return (
    <ExpandablePanel id="meetings" title="פגישות" icon="📅" count={total} projectId={projectId}>
      {meetings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">אין פגישות</p>
      ) : (
        <div className="space-y-2">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`p-2 rounded hover:bg-muted ${isPast(meeting.startTime) ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{meeting.title}</span>
                <Badge variant={isPast(meeting.startTime) ? 'secondary' : 'default'}>
                  {isPast(meeting.startTime) ? 'עבר' : 'קרוב'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{formatDateTime(meeting.startTime)}</div>
            </div>
          ))}
          {total > 5 && (
            <div className="pt-2 border-t">
              <Link href={`/meetings?projectId=${projectId}`}>
                <Button variant="ghost" size="sm" className="w-full">
                  צפה בכל {total} הפגישות &larr;
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </ExpandablePanel>
  );
}
