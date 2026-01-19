/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MeetingDetailsProps {
  meetingId: string;
}

const meetingTypeLabels: Record<string, string> = {
  initial_consultation: 'פגישת היכרות',
  design_review: 'סקירת עיצוב',
  site_visit: 'ביקור באתר',
  client_presentation: 'מצגת ללקוח',
  internal: 'פנימי',
  other: 'אחר',
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  scheduled: { label: 'מתוכנן', variant: 'outline' },
  confirmed: { label: 'מאושר', variant: 'default' },
  cancelled: { label: 'בוטל', variant: 'destructive' },
  completed: { label: 'הושלם', variant: 'secondary' },
  rescheduled: { label: 'נדחה', variant: 'outline' },
};

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MeetingDetails({ meetingId }: MeetingDetailsProps) {
  const utils = trpc.useUtils();

  const { data: meeting, isLoading } = trpc.meetings.getById.useQuery({ id: meetingId });

  const confirmMutation = trpc.meetings.confirm.useMutation({
    onSuccess: () => {
      utils.meetings.getById.invalidate({ id: meetingId });
    },
  });

  const cancelMutation = trpc.meetings.cancel.useMutation({
    onSuccess: () => {
      utils.meetings.getById.invalidate({ id: meetingId });
    },
  });

  const completeMutation = trpc.meetings.complete.useMutation({
    onSuccess: () => {
      utils.meetings.getById.invalidate({ id: meetingId });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">טוען...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">פגישה לא נמצאה</p>
      </div>
    );
  }

  const statusInfo = statusLabels[meeting.status] ?? { label: 'מתוכנן', variant: 'outline' as const };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">פרטי פגישה</h1>
        <div className="flex gap-2">
          {meeting.status === 'scheduled' && (
            <>
              <Button
                onClick={() => confirmMutation.mutate({ id: meetingId })}
                disabled={confirmMutation.isPending}
              >
                אישור
              </Button>
              <Button
                variant="destructive"
                onClick={() => cancelMutation.mutate({ id: meetingId })}
                disabled={cancelMutation.isPending}
              >
                ביטול
              </Button>
            </>
          )}
          {meeting.status === 'confirmed' && meeting.computed.isPast && (
            <Button
              onClick={() => completeMutation.mutate({ id: meetingId })}
              disabled={completeMutation.isPending}
            >
              סמן כהושלם
            </Button>
          )}
        </div>
      </div>

      <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{meeting.title}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  {meetingTypeLabels[meeting.meetingType] || meeting.meetingType}
                </p>
              </div>
              <Badge variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {meeting.description && (
              <div>
                <h3 className="font-medium mb-2">תיאור</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{meeting.description}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-1">התחלה</h3>
                <p className="text-muted-foreground">{formatDateTime(meeting.startTime)}</p>
              </div>

              <div>
                <h3 className="font-medium mb-1">סיום</h3>
                <p className="text-muted-foreground">{formatDateTime(meeting.endTime)}</p>
              </div>

              <div>
                <h3 className="font-medium mb-1">משך</h3>
                <p className="text-muted-foreground">{meeting.computed.durationFormatted}</p>
              </div>

              {meeting.location && (
                <div>
                  <h3 className="font-medium mb-1">מיקום</h3>
                  <p className="text-muted-foreground">{meeting.location}</p>
                </div>
              )}

              {meeting.project && (
                <div>
                  <h3 className="font-medium mb-1">פרויקט</h3>
                  <p className="text-muted-foreground">{meeting.project.name}</p>
                </div>
              )}

              {meeting.client && (
                <div>
                  <h3 className="font-medium mb-1">לקוח</h3>
                  <p className="text-muted-foreground">{meeting.client.name}</p>
                </div>
              )}
            </div>

            {/* Attendees */}
            {meeting.attendees && meeting.attendees.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">משתתפים ({meeting.computed.attendeesCount})</h3>
                <div className="flex flex-wrap gap-2">
                  {meeting.attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                        {attendee.firstName[0]}{attendee.lastName[0]}
                      </div>
                      <span className="text-sm">
                        {attendee.firstName} {attendee.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Attendees */}
            {meeting.externalAttendees && meeting.externalAttendees.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">משתתפים חיצוניים</h3>
                <div className="flex flex-wrap gap-2">
                  {meeting.externalAttendees.map((attendee, index) => (
                    <div
                      key={index}
                      className="px-3 py-1.5 bg-muted rounded-full text-sm"
                    >
                      {attendee}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {meeting.notes && (
              <div>
                <h3 className="font-medium mb-2">הערות</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{meeting.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
    </>
  );
}
