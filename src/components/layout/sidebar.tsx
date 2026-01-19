/* eslint-disable max-lines-per-function, max-lines */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Building2,
  CheckSquare,
  Package,
  Settings,
  ChevronDown,
  ChevronLeft,
  Wallet,
} from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'דשבורד',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'פרויקטים',
    href: '/projects',
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    label: 'אנשי קשר',
    icon: <Users className="h-5 w-5" />,
    children: [
      { label: 'כל אנשי הקשר', href: '/contacts' },
      { label: 'לקוחות', href: '/clients' },
      { label: 'ספקים', href: '/suppliers' },
      { label: 'אנשי מקצוע', href: '/professionals' },
    ],
  },
  {
    label: 'ניהול עבודה',
    icon: <CheckSquare className="h-5 w-5" />,
    children: [
      { label: 'משימות', href: '/tasks' },
      { label: 'מסמכים', href: '/documents' },
      { label: 'פגישות', href: '/meetings' },
      { label: 'יומן', href: '/calendar' },
    ],
  },
  {
    label: 'מוצרים ורכש',
    icon: <Package className="h-5 w-5" />,
    children: [
      { label: 'קטלוג מוצרים', href: '/products' },
      { label: 'הזמנות רכש', href: '/purchase-orders' },
      { label: 'מעקב משלוחים', href: '/deliveries' },
    ],
  },
  {
    label: 'פיננסי',
    icon: <Wallet className="h-5 w-5" />,
    children: [
      { label: 'הצעות מחיר', href: '/proposals' },
      { label: 'חוזים', href: '/contracts' },
      { label: 'מקדמות', href: '/retainers' },
      { label: 'תשלומים', href: '/payments' },
      { label: 'הוצאות', href: '/expenses' },
      { label: 'מעקב זמן', href: '/time-tracking' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<string[]>(['אנשי קשר', 'ניהול עבודה', 'מוצרים ורכש', 'פיננסי']);

  const toggleCategory = (label: string) => {
    setOpenCategories((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const isChildActive = (children: { href: string }[]) => {
    return children.some((child) => pathname.startsWith(child.href));
  };

  return (
    <aside className="fixed top-0 right-0 h-screen w-64 bg-white border-l border-[#E2E8F0] flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-[#E2E8F0]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-[#1E293B]">Architect Studio</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.children ? (
                /* Category with children */
                <div>
                  <button
                    onClick={() => toggleCategory(item.label)}
                    className={`w-full flex items-center justify-between h-11 px-4 mx-3 rounded-lg transition-colors ${
                      isChildActive(item.children)
                        ? 'bg-[#EFF6FF] text-[#2563EB]'
                        : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
                    }`}
                    style={{ width: 'calc(100% - 24px)' }}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </span>
                    {openCategories.includes(item.label) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </button>
                  {openCategories.includes(item.label) && (
                    <ul className="mt-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href as Route}
                            className={`flex items-center h-10 pr-12 pl-4 mx-3 rounded-lg text-sm transition-colors ${
                              isActive(child.href)
                                ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                                : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
                            }`}
                            style={{ width: 'calc(100% - 24px)' }}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                /* Simple link */
                <Link
                  href={item.href as Route}
                  className={`flex items-center gap-3 h-11 px-4 mx-3 rounded-lg text-sm transition-colors ${
                    isActive(item.href!)
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                      : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
                  }`}
                  style={{ width: 'calc(100% - 24px)' }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings - Bottom */}
      <div className="border-t border-[#E2E8F0] p-3">
        <Link
          href="/settings"
          className={`flex items-center gap-3 h-11 px-4 rounded-lg text-sm transition-colors ${
            isActive('/settings')
              ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
              : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>הגדרות</span>
        </Link>
      </div>
    </aside>
  );
}
