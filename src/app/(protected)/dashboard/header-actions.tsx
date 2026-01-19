'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import type { Route } from 'next';

interface HeaderActionsProps {
  userName: string;
}

export function HeaderActions({ userName }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-4">
      <Link href={'/settings' as Route}>
        <Button variant="ghost" size="sm">הגדרות</Button>
      </Link>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{userName}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          התנתק
        </Button>
      </div>
    </div>
  );
}
