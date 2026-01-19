'use client';

import Link from 'next/link';
import { HeaderNav } from './header-nav';
import { HeaderActions } from './header-actions';
import type { Route } from 'next';

interface DashboardHeaderProps {
  userName: string;
  tenantName: string;
}

export function DashboardHeader({ userName, tenantName }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={'/dashboard' as Route} className="text-xl font-bold">
            {tenantName}
          </Link>
          <HeaderNav />
        </div>
        <HeaderActions userName={userName} />
      </div>
    </header>
  );
}
