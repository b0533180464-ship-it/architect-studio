/* eslint-disable max-lines-per-function */
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { DAYS_HE, HOURS, MEETING_TYPE_COLORS, formatTime, isSameDay } from '../utils/meeting-colors';

interface Meeting {
  id: string;
  title: string;
  meetingType: string;
  startTime: Date;
  endTime: Date;
}

interface WeekViewProps {
  currentDate: Date;
  meetings: Meeting[];
  onDateClick: (date: Date) => void;
}

export function WeekView({ currentDate, meetings, onDateClick }: WeekViewProps) {
  const today = new Date();

  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const getMeetingsForDayHour = (date: Date, hour: number) => {
    return meetings.filter((m) => {
      const start = new Date(m.startTime);
      return isSameDay(start, date) && start.getHours() === hour;
    });
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 text-center text-sm text-muted-foreground border-l">שעה</div>
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div key={i} className={`p-2 text-center border-l ${isToday ? 'bg-primary/10' : ''}`}>
              <div className="text-sm font-medium">{DAYS_HE[i]}</div>
              <div className={`text-lg ${isToday ? 'text-primary font-bold' : ''}`}>{day.getDate()}</div>
            </div>
          );
        })}
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b min-h-16">
            <div className="p-2 text-center text-sm text-muted-foreground border-l">{hour}:00</div>
            {weekDays.map((day, i) => {
              const hourMeetings = getMeetingsForDayHour(day, hour);
              const isToday = isSameDay(day, today);
              const slotDate = new Date(day);
              slotDate.setHours(hour, 0, 0, 0);

              return (
                <div
                  key={i}
                  className={`p-1 border-l cursor-pointer hover:bg-muted/50 ${isToday ? 'bg-primary/5' : ''}`}
                  onClick={() => onDateClick(slotDate)}
                >
                  {hourMeetings.map((m) => {
                    const colors = MEETING_TYPE_COLORS[m.meetingType] ?? MEETING_TYPE_COLORS.other!;
                    return (
                      <Link key={m.id} href={`/meetings/${m.id}` as Route} onClick={(e) => e.stopPropagation()}>
                        <div className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate ${colors.bg} ${colors.text} ${colors.border} border`}>
                          {formatTime(m.startTime)} {m.title}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
