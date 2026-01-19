/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MONTHS_HE } from '../utils/meeting-colors';

export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const views: { id: CalendarViewType; label: string }[] = [
  { id: 'month', label: 'חודש' },
  { id: 'week', label: 'שבוע' },
  { id: 'day', label: 'יום' },
  { id: 'agenda', label: 'רשימה' },
];

export function CalendarHeader({ currentDate, view, onViewChange, onPrev, onNext, onToday }: CalendarHeaderProps) {
  const getTitle = () => {
    const year = currentDate.getFullYear();
    const month = MONTHS_HE[currentDate.getMonth()];
    if (view === 'day') {
      return `${currentDate.getDate()} ${month} ${year}`;
    }
    if (view === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()}-${weekEnd.getDate()} ${month} ${year}`;
      }
      return `${weekStart.getDate()} ${MONTHS_HE[weekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTHS_HE[weekEnd.getMonth()]} ${year}`;
    }
    return `${month} ${year}`;
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">← חזרה</Link>
          <h1 className="text-xl font-semibold">יומן</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrev}>←</Button>
          <Button variant="outline" size="sm" onClick={onNext}>→</Button>
          <Button variant="ghost" size="sm" onClick={onToday}>היום</Button>
          <span className="text-lg font-medium mx-4 min-w-48 text-center">{getTitle()}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            {views.map((v) => (
              <Button key={v.id} variant={view === v.id ? 'default' : 'ghost'} size="sm" className="rounded-none" onClick={() => onViewChange(v.id)}>
                {v.label}
              </Button>
            ))}
          </div>
          <Link href="/meetings/new"><Button>פגישה חדשה</Button></Link>
        </div>
      </div>
    </header>
  );
}
