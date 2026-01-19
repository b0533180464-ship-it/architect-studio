'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc';
import type { MultiUserCellProps } from '../types';

interface UserData { id: string; firstName: string; lastName: string }

/**
 * תא בחירת משתמשים מרובים
 */
export function MultiUserCell({ value, onSave, disabled }: MultiUserCellProps) {
  const [open, setOpen] = useState(false);
  const { data: users } = trpc.user.list.useQuery();

  const toggleUser = (userId: string) => {
    const newValue = value.includes(userId) ? value.filter((id) => id !== userId) : [...value, userId];
    onSave(newValue);
  };

  const count = users?.filter((u) => value.includes(u.id)).length ?? 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 gap-1" disabled={disabled}>
          <Users className="h-4 w-4" />
          {count > 0 && <span className="text-xs">{count}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {users?.map((user) => <UserItem key={user.id} user={user} checked={value.includes(user.id)} onToggle={() => toggleUser(user.id)} />)}
          {(!users || users.length === 0) && <div className="text-sm text-muted-foreground py-2">אין משתמשים</div>}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function UserItem({ user, checked, onToggle }: { user: UserData; checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      <span className="text-sm">{user.firstName} {user.lastName}</span>
    </label>
  );
}
