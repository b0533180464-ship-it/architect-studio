'use client';

import { trpc } from '@/lib/trpc';
import { DashboardMain } from './dashboard-main';
import { LoadingState } from './loading-state';
import { ErrorState } from './error-state';

export function DashboardContent() {
  const { data: user, isLoading: userLoading } = trpc.user.me.useQuery();
  const { data: tenant, isLoading: tenantLoading } = trpc.tenant.getCurrent.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.tenant.getStats.useQuery();

  if (userLoading || tenantLoading) return <LoadingState />;
  if (!user || !tenant) return <ErrorState />;

  return <DashboardMain user={user} tenant={tenant} stats={stats} statsLoading={statsLoading} />;
}
