'use client';

import { DynamicSidebar } from './dynamic-sidebar';
import { Header } from './header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl">
      {/* Sidebar - Fixed on right */}
      <DynamicSidebar />

      {/* Header - Fixed on top, offset by sidebar width */}
      <Header />

      {/* Main Content - Offset by sidebar width and header height */}
      <main className="mr-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
