'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';

export function SidebarHeader() {
  return (
    <div className="h-16 flex items-center px-4 border-b border-[#E2E8F0]">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <span className="font-semibold text-[#1E293B]">Architect Studio</span>
      </Link>
    </div>
  );
}
