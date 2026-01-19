'use client';

import { useState } from 'react';
import { ConfigEntityList } from './config/config-entity-list';
import { cn } from '@/lib/utils';
import type { ConfigurableEntityType } from '@/server/routers/config/schemas';

const SECTIONS: { id: ConfigurableEntityType; label: string }[] = [
  { id: 'project_type', label: 'סוגי פרויקט' },
  { id: 'project_status', label: 'סטטוסי פרויקט' },
  { id: 'project_phase', label: 'שלבי פרויקט' },
  { id: 'task_status', label: 'סטטוסי משימה' },
  { id: 'task_category', label: 'קטגוריות משימה' },
  { id: 'room_type', label: 'סוגי חדרים' },
  { id: 'room_status', label: 'סטטוסי חדרים' },
  { id: 'document_category', label: 'קטגוריות מסמכים' },
  { id: 'supplier_category', label: 'קטגוריות ספקים' },
  { id: 'trade', label: 'מקצועות' },
];

function SectionNav({ active, onChange }: { active: ConfigurableEntityType; onChange: (id: ConfigurableEntityType) => void }) {
  return (
    <nav className="w-48 shrink-0 space-y-1">
      {SECTIONS.map((s) => (
        <button key={s.id} onClick={() => onChange(s.id)} className={cn('w-full rounded-md px-3 py-2 text-right text-sm', active === s.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
          {s.label}
        </button>
      ))}
    </nav>
  );
}

export function ConfigTab() {
  const [active, setActive] = useState<ConfigurableEntityType>('project_type');
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">הגדרות כלליות</h2>
        <p className="text-sm text-muted-foreground">נהל סטטוסים, קטגוריות וסוגים עבור הפרויקטים שלך</p>
      </div>
      <div className="flex gap-6">
        <SectionNav active={active} onChange={setActive} />
        <div className="flex-1">
          <ConfigEntityList entityType={active} title={SECTIONS.find((s) => s.id === active)?.label || ''} />
        </div>
      </div>
    </div>
  );
}
