'use client';

import { trpc } from '@/lib/trpc';
import { SettingsTabs } from './settings-tabs';

export function SettingsContent() {
  const { data: tenant, isLoading } = trpc.tenant.getCurrent.useQuery();
  const { data: user } = trpc.user.me.useQuery();

  if (isLoading) return <LoadingState />;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">הגדרות</h1>
        {tenant?.name && (
          <span className="text-sm text-muted-foreground">{tenant.name}</span>
        )}
      </div>

      <SettingsTabs tenant={tenant} user={user} userRole={user?.role ?? 'member'} />
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-muted-foreground">טוען...</div>
    </div>
  );
}
