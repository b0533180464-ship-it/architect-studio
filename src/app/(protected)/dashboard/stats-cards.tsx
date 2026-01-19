'use client';

import { FolderKanban, Users, UserCircle } from 'lucide-react';

interface StatsCardsProps {
  stats?: {
    users: number;
    clients: number;
    projects: number;
  };
  isLoading: boolean;
}

const STAT_CARDS = [
  {
    key: 'projects',
    title: 'פרויקטים פעילים',
    icon: FolderKanban,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    valueColor: 'text-blue-600',
  },
  {
    key: 'clients',
    title: 'לקוחות',
    icon: Users,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    valueColor: 'text-emerald-600',
  },
  {
    key: 'users',
    title: 'חברי צוות',
    icon: UserCircle,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-500',
    valueColor: 'text-amber-600',
  },
] as const;

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {STAT_CARDS.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;

        return (
          <div
            key={card.key}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-xl ${card.bgColor} p-3`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              {isLoading ? (
                <div className="h-10 w-16 animate-pulse rounded-lg bg-slate-100" />
              ) : (
                <span className={`text-4xl font-bold ${card.valueColor}`}>
                  {value}
                </span>
              )}
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">{card.title}</p>
          </div>
        );
      })}
    </div>
  );
}
