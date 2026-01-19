'use client';

import { useState } from 'react';
import { ProfileTab } from './tabs/profile-tab';
import { DisplayTab } from './tabs/display-tab';
import { NotificationsTab } from './tabs/notifications-tab';
import { PrivacyTab } from './tabs/privacy-tab';
import { SessionsTab } from './tabs/sessions-tab';
import { SecurityTab } from './tabs/security-tab';
import { TenantTab } from './tabs/tenant-tab';
import { TeamTab } from './tabs/team-tab';
import { ConfigTab } from './tabs/config-tab';
import type { Tenant, User } from '@prisma/client';

const TABS = [
  { id: 'profile', label: 'פרופיל', component: ProfileTab },
  { id: 'display', label: 'תצוגה', component: DisplayTab },
  { id: 'notifications', label: 'התראות', component: NotificationsTab },
  { id: 'privacy', label: 'פרטיות', component: PrivacyTab },
  { id: 'security', label: 'אבטחה', component: SecurityTab },
  { id: 'sessions', label: 'מכשירים', component: SessionsTab },
  { id: 'tenant', label: 'משרד', component: TenantTab, ownerOnly: true },
  { id: 'team', label: 'צוות', component: TeamTab, managerOnly: true },
  { id: 'config', label: 'הגדרות כלליות', component: ConfigTab, managerOnly: true },
];

interface Props {
  tenant: Tenant | null | undefined;
  user: Partial<User> | null | undefined;
  userRole: string;
}

export function SettingsTabs({ tenant, user, userRole }: Props) {
  const [activeTab, setActiveTab] = useState('profile');
  const visibleTabs = getVisibleTabs(userRole);
  const ActiveComponent = visibleTabs.find((t) => t.id === activeTab)?.component || ProfileTab;

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <TabNav tabs={visibleTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 rounded-lg border bg-card p-6">
        <ActiveComponent tenant={tenant} user={user} />
      </div>
    </div>
  );
}

function getVisibleTabs(userRole: string) {
  const isOwner = userRole === 'owner';
  const isManager = userRole === 'owner' || userRole === 'manager';
  return TABS.filter((tab) => {
    if (tab.ownerOnly && !isOwner) return false;
    if (tab.managerOnly && !isManager) return false;
    return true;
  });
}

interface TabNavProps {
  tabs: typeof TABS;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="w-full space-y-1 md:w-48">
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => onTabChange(tab.id)}
          className={`w-full rounded-lg px-4 py-2 text-right transition-colors ${
            activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
