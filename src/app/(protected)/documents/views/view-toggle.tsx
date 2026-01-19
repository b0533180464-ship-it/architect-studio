'use client';

import { Button } from '@/components/ui/button';

export type DocumentViewType = 'grid' | 'list';

interface ViewToggleProps {
  view: DocumentViewType;
  onViewChange: (view: DocumentViewType) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex border rounded-lg overflow-hidden">
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        className="rounded-none gap-1"
        onClick={() => onViewChange('grid')}
      >
        <GridIcon />
        רשת
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        className="rounded-none gap-1"
        onClick={() => onViewChange('list')}
      >
        <ListIcon />
        רשימה
      </Button>
    </div>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="2" y1="4" x2="14" y2="4" />
      <line x1="2" y1="8" x2="14" y2="8" />
      <line x1="2" y1="12" x2="14" y2="12" />
    </svg>
  );
}
