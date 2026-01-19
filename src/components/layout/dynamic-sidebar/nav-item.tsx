/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavIcon } from './nav-icon';
import type { NavigationItemWithChildren } from './types';

interface NavItemProps {
  item: NavigationItemWithChildren;
  isOpen: boolean;
  onToggle: () => void;
}

const itemBaseClass = 'flex items-center gap-3 h-11 px-4 mx-3 rounded-lg text-sm transition-colors';
const activeClass = 'bg-[#EFF6FF] text-[#2563EB] font-medium';
const inactiveClass = 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]';

export function NavItem({ item, isOpen, onToggle }: NavItemProps) {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;
  const isCategory = !item.href && item.icon; // Category = has icon but no href

  const isActive = (href: string | null) => {
    if (!href) return false;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const isChildActive = () => item.children?.some((c) => c.href && pathname.startsWith(c.href));

  // Render as category (with or without children)
  if (hasChildren || isCategory) {
    return (
      <NavItemCategory
        item={item}
        isOpen={isOpen}
        onToggle={onToggle}
        isChildActive={isChildActive()}
        isActive={isActive}
      />
    );
  }

  // Items without href that aren't categories - don't render
  if (!item.href) return null;

  // Regular link item
  return (
    <Link
      href={item.href as Route}
      className={cn(itemBaseClass, isActive(item.href) ? activeClass : inactiveClass)}
      style={{ width: 'calc(100% - 24px)' }}
    >
      <NavIcon name={item.icon} />
      <span>{item.label}</span>
    </Link>
  );
}

// Category with children
interface NavItemCategoryProps {
  item: NavigationItemWithChildren;
  isOpen: boolean;
  onToggle: () => void;
  isChildActive: boolean | undefined;
  isActive: (href: string | null) => boolean;
}

function NavItemCategory({ item, isOpen, onToggle, isChildActive, isActive }: NavItemCategoryProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between h-11 px-4 mx-3 rounded-lg transition-colors',
          isChildActive ? activeClass : inactiveClass
        )}
        style={{ width: 'calc(100% - 24px)' }}
      >
        <span className="flex items-center gap-3">
          <NavIcon name={item.icon} />
          <span className="text-sm">{item.label}</span>
        </span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
      {isOpen && (
        <ul className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <NavItemChild key={child.id} item={child} isActive={isActive(child.href)} />
          ))}
        </ul>
      )}
    </div>
  );
}

// Child item
function NavItemChild({ item, isActive }: { item: NavigationItemWithChildren; isActive: boolean }) {
  if (!item.href) return null;
  return (
    <li>
      <Link
        href={item.href as Route}
        className={cn(
          'flex items-center h-10 pr-12 pl-4 mx-3 rounded-lg text-sm transition-colors',
          isActive ? activeClass : inactiveClass
        )}
        style={{ width: 'calc(100% - 24px)' }}
      >
        {item.label}
      </Link>
    </li>
  );
}
