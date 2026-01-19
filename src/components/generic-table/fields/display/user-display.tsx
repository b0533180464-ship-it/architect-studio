'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import type { FieldDisplayProps } from '../types';

type UserDisplayType = 'user' | 'users';

interface UserFieldDisplayProps extends FieldDisplayProps {
  type: UserDisplayType;
}

// Get user initials for avatar fallback
function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase() || '?';
}

// Get full name
function getFullName(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(' ') || 'משתמש';
}

export function UserFieldDisplay({ type, value, className }: UserFieldDisplayProps) {
  // Check if we have a value
  const hasValue = type === 'users'
    ? Array.isArray(value) && value.length > 0
    : value !== null && value !== undefined && value !== '';

  // Fetch users only if we have IDs to display
  const { data: users, isLoading } = trpc.user.list.useQuery(undefined, {
    enabled: hasValue,
  });

  if (!hasValue) {
    return <span className={cn('text-muted-foreground', className)}>—</span>;
  }

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  // Single user
  if (type === 'user') {
    const user = users?.find((u) => u.id === value);
    if (!user) {
      return <span className={cn('text-muted-foreground', className)}>—</span>;
    }

    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Avatar className="h-5 w-5">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback className="text-[10px]">
            {getInitials(user.firstName, user.lastName)}
          </AvatarFallback>
        </Avatar>
        <span>{getFullName(user.firstName, user.lastName)}</span>
      </div>
    );
  }

  // Multiple users
  const selectedUserIds = value as string[];
  const selectedUsers = (users ?? []).filter((u) => selectedUserIds.includes(u.id));

  if (selectedUsers.length === 0) {
    return <span className={cn('text-muted-foreground', className)}>—</span>;
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {selectedUsers.map((user) => (
        <Badge key={user.id} variant="secondary" className="text-xs gap-1">
          <Avatar className="h-4 w-4">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="text-[8px]">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          {getFullName(user.firstName, user.lastName)}
        </Badge>
      ))}
    </div>
  );
}
