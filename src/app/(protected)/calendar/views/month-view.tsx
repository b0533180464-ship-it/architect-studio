/* eslint-disable max-lines-per-function */
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { DAYS_HE, MEETING_TYPE_COLORS, formatTime, isSameDay } from '../utils/meeting-colors';

interface Meeting {
  id: string;
  title: string;
  meetingType: string;
  startTime: Date;
  endTime: Date;
}

interface MonthViewProps {
  currentDate: Date;
  meetings: Meeting[];
  onDateClick: (date: Date) => void;
}

export function MonthView({ currentDate, meetings, onDateClick }: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [year, month]);

  const meetingsByDate = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    meetings.forEach((m) => {
      const d = new Date(m.startTime);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    return map;
  }, [meetings]);

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="grid grid-cols-7 gap-1">
        {DAYS_HE.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">{day}</div>
        ))}
        {calendarDays.map(({ date, isCurrentMonth }, i) => {
          const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          const dayMeetings = meetingsByDate.get(key) || [];
          const isToday = isSameDay(date, today);
          const maxVisible = 3;

          return (
            <div
              key={i}
              className={`min-h-28 p-1 border rounded cursor-pointer hover:bg-muted/50 transition-colors ${
                isCurrentMonth ? 'bg-background' : 'bg-muted/30'
              } ${isToday ? 'ring-2 ring-primary' : ''}`}
              onClick={() => onDateClick(date)}
            >
              <div className={`text-sm mb-1 ${isCurrentMonth ? '' : 'text-muted-foreground'} ${isToday ? 'font-bold text-primary' : ''}`}>
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayMeetings.slice(0, maxVisible).map((m) => {
                  const colors = MEETING_TYPE_COLORS[m.meetingType] ?? MEETING_TYPE_COLORS.other!;
                  return (
                    <Link key={m.id} href={`/meetings/${m.id}` as Route} onClick={(e) => e.stopPropagation()}>
                      <div className={`text-xs px-1 py-0.5 rounded truncate ${colors.bg} ${colors.text}`}>
                        {formatTime(m.startTime)} {m.title}
                      </div>
                    </Link>
                  );
                })}
                {dayMeetings.length > maxVisible && (
                  <div className="text-xs text-muted-foreground text-center">+{dayMeetings.length - maxVisible} עוד</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
