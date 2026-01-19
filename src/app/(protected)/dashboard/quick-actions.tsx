'use client';

import Link from 'next/link';
import { FolderPlus, UserPlus, Settings, type LucideIcon } from 'lucide-react';
import type { Route } from 'next';

interface QuickAction {
  title: string;
  description: string;
  href: Route;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  hoverBg: string;
}

const ACTIONS: QuickAction[] = [
  {
    title: 'פרויקט חדש',
    description: 'צור פרויקט חדש ללקוח',
    href: '/projects/new' as Route,
    icon: FolderPlus,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    hoverBg: 'hover:bg-blue-100',
  },
  {
    title: 'לקוח חדש',
    description: 'הוסף לקוח חדש למערכת',
    href: '/clients/new' as Route,
    icon: UserPlus,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    hoverBg: 'hover:bg-emerald-100',
  },
  {
    title: 'הגדרות',
    description: 'נהל את הגדרות המשרד',
    href: '/settings' as Route,
    icon: Settings,
    bgColor: 'bg-slate-100',
    iconColor: 'text-slate-500',
    hoverBg: 'hover:bg-slate-200',
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <h2 className="text-lg font-semibold text-slate-900">פעולות מהירות</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {ACTIONS.map((action) => (
          <QuickActionButton key={action.href} {...action} />
        ))}
      </div>
    </div>
  );
}

function QuickActionButton({ title, description, href, icon: Icon, bgColor, iconColor, hoverBg }: QuickAction) {
  return (
    <Link
      href={href}
      className={`group flex flex-col items-start gap-3 rounded-xl border border-slate-200 p-4 transition-all ${hoverBg} hover:shadow-md`}
    >
      <div className={`rounded-lg ${bgColor} p-2.5 transition-transform group-hover:scale-110`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <span className="block font-medium text-slate-900">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
      </div>
    </Link>
  );
}
