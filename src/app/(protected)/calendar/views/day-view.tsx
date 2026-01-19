/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { HOURS, MEETING_TYPE_COLORS, formatTime, isSameDay } from '../utils/meeting-colors';

interface Meeting {
  id: string;
  title: string;
  meetingType: string;
  startTime: Date;
  endTime: Date;
  location?: string | null;
  project?: { name: string } | null;
}

interface DayViewProps {
  currentDate: Date;
  meetings: Meeting[];
  onTimeClick: (date: Date) => void;
}

export function DayView({ currentDate, meetings, onTimeClick }: DayViewProps) {
  const dayMeetings = meetings.filter((m) => isSameDay(new Date(m.startTime), currentDate));

  const getMeetingsForHour = (hour: number) => {
    return dayMeetings.filter((m) => new Date(m.startTime).getHours() === hour);
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="max-h-[700px] overflow-y-auto">
        {HOURS.map((hour) => {
          const hourMeetings = getMeetingsForHour(hour);
          const slotDate = new Date(currentDate);
          slotDate.setHours(hour, 0, 0, 0);

          return (
            <div key={hour} className="grid grid-cols-12 border-b min-h-20">
              <div className="col-span-1 p-2 text-center text-sm text-muted-foreground border-l bg-muted/30">
                {hour}:00
              </div>
              <div
                className="col-span-11 p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onTimeClick(slotDate)}
              >
                {hourMeetings.map((m) => {
                  const colors = MEETING_TYPE_COLORS[m.meetingType] ?? MEETING_TYPE_COLORS.other!;
                  const start = new Date(m.startTime);
                  const end = new Date(m.endTime);
                  const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

                  return (
                    <Link key={m.id} href={`/meetings/${m.id}` as Route} onClick={(e) => e.stopPropagation()}>
                      <div className={`px-3 py-2 rounded mb-1 ${colors.bg} ${colors.text} ${colors.border} border`}>
                        <div className="font-medium">{m.title}</div>
                        <div className="text-xs mt-1 flex flex-wrap gap-x-4">
                          <span>{formatTime(m.startTime)} - {formatTime(m.endTime)} ({duration} דק׳)</span>
                          {m.location && <span>📍 {m.location}</span>}
                          {m.project && <span>פרויקט: {m.project.name}</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
