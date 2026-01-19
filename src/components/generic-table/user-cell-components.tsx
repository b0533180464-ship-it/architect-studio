'use client';

import { useState } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';

// Helper functions for user display
function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase() || '?';
}

function getFullName(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(' ') || 'משתמש';
}

/**
 * תא בחירת משתמש בודד
 */
export function UserCell({
  value,
  onSave,
  placeholder,
  disabled,
}: {
  value: unknown;
  onSave: (value: unknown) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedUserId = value as string | null;

  const { data: users, isLoading } = trpc.user.list.useQuery(undefined, {
    enabled: isOpen || !!selectedUserId,
  });

  const selectedUser = users?.find((u) => u.id === selectedUserId);

  const filteredUsers = (users ?? []).filter((u) => {
    if (!search) return true;
    const fullName = getFullName(u.firstName, u.lastName).toLowerCase();
    const email = u.email?.toLowerCase() || '';
    return fullName.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  const handleSelect = (userId: string) => {
    onSave(userId === selectedUserId ? null : userId);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <Popover open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setSearch(''); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'w-full min-h-[32px] px-2 py-1 text-sm text-right rounded flex items-center gap-2',
            'hover:bg-muted/50 focus:outline-none',
            disabled && 'opacity-50 cursor-not-allowed',
            !selectedUser && 'text-muted-foreground'
          )}
        >
          {selectedUser ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarImage src={selectedUser.avatar || undefined} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(selectedUser.firstName, selectedUser.lastName)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{getFullName(selectedUser.firstName, selectedUser.lastName)}</span>
            </>
          ) : (
            <span>{placeholder || 'בחר משתמש...'}</span>
          )}
          <ChevronDown className="h-4 w-4 mr-auto shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <Input
          placeholder="חיפוש..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 mb-2"
        />
        <ScrollArea className="max-h-48">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {search ? 'לא נמצאו תוצאות' : 'אין משתמשים'}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded text-sm w-full',
                    'hover:bg-muted transition-colors text-right',
                    selectedUserId === user.id && 'bg-muted'
                  )}
                  onClick={() => handleSelect(user.id)}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-right">
                    <div>{getFullName(user.firstName, user.lastName)}</div>
                    {user.title && (
                      <div className="text-xs text-muted-foreground">{user.title}</div>
                    )}
                  </div>
                  {selectedUserId === user.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

/**
 * תא בחירת משתמשים מרובים
 */
export function UsersCell({
  value,
  onSave,
  placeholder,
  disabled,
}: {
  value: unknown;
  onSave: (value: unknown) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedUserIds = (value as string[]) || [];

  const { data: users, isLoading } = trpc.user.list.useQuery(undefined, {
    enabled: isOpen || selectedUserIds.length > 0,
  });

  const selectedUsers = (users ?? []).filter((u) => selectedUserIds.includes(u.id));

  const filteredUsers = (users ?? []).filter((u) => {
    if (!search) return true;
    const fullName = getFullName(u.firstName, u.lastName).toLowerCase();
    const email = u.email?.toLowerCase() || '';
    return fullName.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  const toggleUser = (userId: string) => {
    const newValue = selectedUserIds.includes(userId)
      ? selectedUserIds.filter((id) => id !== userId)
      : [...selectedUserIds, userId];
    onSave(newValue.length > 0 ? newValue : null);
  };

  return (
    <Popover open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setSearch(''); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'w-full min-h-[32px] px-2 py-1 text-sm text-right rounded flex items-center gap-1 flex-wrap',
            'hover:bg-muted/50 focus:outline-none',
            disabled && 'opacity-50 cursor-not-allowed',
            selectedUsers.length === 0 && 'text-muted-foreground'
          )}
        >
          {selectedUsers.length > 0 ? (
            selectedUsers.map((user) => (
              <Badge key={user.id} variant="secondary" className="gap-1 text-xs">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                {getFullName(user.firstName, user.lastName)}
              </Badge>
            ))
          ) : (
            <span>{placeholder || 'בחר משתמשים...'}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <Input
          placeholder="חיפוש..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 mb-2"
        />
        <ScrollArea className="max-h-48">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {search ? 'לא נמצאו תוצאות' : 'אין משתמשים'}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded text-sm w-full',
                    'hover:bg-muted transition-colors text-right',
                    selectedUserIds.includes(user.id) && 'bg-muted'
                  )}
                  onClick={() => toggleUser(user.id)}
                >
                  <div className={cn(
                    'w-4 h-4 border rounded flex items-center justify-center shrink-0',
                    selectedUserIds.includes(user.id) && 'bg-primary border-primary'
                  )}>
                    {selectedUserIds.includes(user.id) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-right">
                    <div>{getFullName(user.firstName, user.lastName)}</div>
                    {user.title && (
                      <div className="text-xs text-muted-foreground">{user.title}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
