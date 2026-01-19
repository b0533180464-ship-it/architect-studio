/* eslint-disable max-lines-per-function */
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { CalendarHeader, MonthView, WeekView, DayView, AgendaView, type CalendarViewType } from './views';

export function CalendarContent() {
  const router = useRouter();
  const [view, setView] = useState<CalendarViewType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: calendarData, isLoading } = trpc.meetings.calendar.useQuery({ year, month });

  const meetings = useMemo(() => {
    if (!calendarData?.meetings) return [];
    return calendarData.meetings.map((m) => ({
      ...m,
      startTime: new Date(m.startTime),
      endTime: new Date(m.endTime),
    }));
  }, [calendarData]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    else if (view === 'day') newDate.setDate(newDate.getDate() - 1);
    else newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    else if (view === 'day') newDate.setDate(newDate.getDate() + 1);
    else newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleDateClick = (date: Date) => {
    const startTime = date.toISOString();
    const endDate = new Date(date);
    endDate.setHours(endDate.getHours() + 1);
    const endTime = endDate.toISOString();
    router.push(`/meetings/new?startTime=${startTime}&endTime=${endTime}`);
  };

  const handleViewChange = (newView: CalendarViewType) => {
    setView(newView);
  };

  return (
    <>
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={handleViewChange}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">טוען...</div>
      ) : (
        <>
          {view === 'month' && <MonthView currentDate={currentDate} meetings={meetings} onDateClick={handleDateClick} />}
          {view === 'week' && <WeekView currentDate={currentDate} meetings={meetings} onDateClick={handleDateClick} />}
          {view === 'day' && <DayView currentDate={currentDate} meetings={meetings} onTimeClick={handleDateClick} />}
          {view === 'agenda' && <AgendaView meetings={meetings} />}
        </>
      )}
    </>
  );
}
