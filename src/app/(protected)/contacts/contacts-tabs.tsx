'use client';

import { cn } from '@/lib/utils';

type ContactType = 'clients' | 'suppliers' | 'professionals';

interface TabInfo {
  id: ContactType;
  label: string;
  count: number;
}

interface ContactsTabsProps {
  activeTab: ContactType;
  onTabChange: (tab: ContactType) => void;
  counts: { clients: number; suppliers: number; professionals: number };
}

export function ContactsTabs({ activeTab, onTabChange, counts }: ContactsTabsProps) {
  const tabs: TabInfo[] = [
    { id: 'clients', label: 'לקוחות', count: counts.clients },
    { id: 'suppliers', label: 'ספקים', count: counts.suppliers },
    { id: 'professionals', label: 'בעלי מקצוע', count: counts.professionals },
  ];

  return (
    <div className="flex border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
          )}
        >
          {tab.label}
          <span className="mr-2 text-xs bg-muted px-2 py-0.5 rounded-full">{tab.count}</span>
        </button>
      ))}
    </div>
  );
}
