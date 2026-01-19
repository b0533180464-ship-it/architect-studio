'use client';

import Link from 'next/link';
import type { Route } from 'next';

const NAV_ITEMS = [
  { href: '/dashboard' as Route, label: 'לוח בקרה' },
  { href: '/projects' as Route, label: 'פרויקטים' },
  { href: '/contacts' as Route, label: 'אנשי קשר' },
  { href: '/tasks' as Route, label: 'משימות' },
  { href: '/products' as Route, label: 'מוצרים' },
  { href: '/calendar' as Route, label: 'יומן' },
  { href: '/documents' as Route, label: 'מסמכים' },
];

export function HeaderNav() {
  return (
    <nav className="hidden md:flex items-center gap-4">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
