'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddNavItemButton } from './add-nav-item-button';

interface SidebarFooterProps {
  onAddLink: () => void;
  onAddCategory: () => void;
  onCreateEntity?: () => void;
}

export function SidebarFooter({ onAddLink, onAddCategory, onCreateEntity }: SidebarFooterProps) {
  const pathname = usePathname();
  const isSettingsActive = pathname.startsWith('/settings');

  return (
    <>
      <div className="px-3 py-2 border-t border-[#E2E8F0]">
        <AddNavItemButton onAddLink={onAddLink} onAddCategory={onAddCategory} onCreateEntity={onCreateEntity} />
      </div>
      <div className="border-t border-[#E2E8F0] p-3">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 h-11 px-4 rounded-lg text-sm transition-colors',
            isSettingsActive
              ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
              : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
          )}
        >
          <Settings className="h-5 w-5" />
          <span>הגדרות</span>
        </Link>
      </div>
    </>
  );
}
