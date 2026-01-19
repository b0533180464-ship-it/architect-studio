'use client';

import { StatsCards } from './stats-cards';
import { QuickActions } from './quick-actions';
import { TodayOverview } from './today-overview';

interface DashboardMainProps {
  user: { firstName: string };
  tenant: { name: string };
  stats?: { users: number; clients: number; projects: number };
  statsLoading: boolean;
}

export function DashboardMain({ user, tenant, stats, statsLoading }: DashboardMainProps) {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'בוקר טוב' : currentHour < 17 ? 'צהריים טובים' : 'ערב טוב';

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {user.firstName}!
        </h1>
        <p className="mt-1 text-slate-500">
          הנה סיכום הפעילות שלך ב-{tenant.name}
        </p>
      </div>

      {/* Stats Section */}
      <StatsCards stats={stats} isLoading={statsLoading} />

      {/* Today Overview Section */}
      <TodayOverview />

      {/* Quick Actions Section */}
      <QuickActions />
    </div>
  );
}
