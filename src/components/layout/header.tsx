/* eslint-disable max-lines-per-function, @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Search, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: user } = trpc.user.me.useQuery();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement global search
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="fixed top-0 right-64 left-0 h-16 bg-white border-b border-[#E2E8F0] z-40">
      <div className="h-full flex items-center justify-between px-6">
        {/* Search - Left side in RTL */}
        <form onSubmit={handleSearch} className="flex-shrink-0">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="חיפוש..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 h-10 pr-10 pl-4 bg-[#F1F5F9] rounded-lg text-sm text-[#1E293B] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-50"
            />
          </div>
        </form>

        {/* Actions - Right side in RTL */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] transition-colors"
            title="התראות"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge - uncomment when needed */}
            {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] transition-colors"
            >
              <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <span className="text-sm font-medium text-[#1E293B]">
                {user ? `${user.firstName} ${user.lastName}` : 'משתמש'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E2E8F0] py-1 z-50">
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span>הגדרות</span>
                </Link>
                <hr className="my-1 border-[#E2E8F0]" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>התנתק</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
