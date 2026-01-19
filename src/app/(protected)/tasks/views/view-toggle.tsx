'use client';

import { Button } from '@/components/ui/button';

export type TaskViewType = 'table' | 'kanban' | 'calendar';

interface ViewToggleProps {
  view: TaskViewType;
  onChange: (view: TaskViewType) => void;
}

const views: { id: TaskViewType; label: string; icon: string }[] = [
  { id: 'table', label: 'טבלה', icon: '▤' },
  { id: 'kanban', label: 'קנבן', icon: '▦' },
  { id: 'calendar', label: 'יומן', icon: '📅' },
];

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex border rounded-lg overflow-hidden">
      {views.map((v) => (
        <Button
          key={v.id}
          variant={view === v.id ? 'default' : 'ghost'}
          size="sm"
          className="rounded-none border-0"
          onClick={() => onChange(v.id)}
        >
          <span className="mr-1">{v.icon}</span>
          {v.label}
        </Button>
      ))}
    </div>
  );
}
