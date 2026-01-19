'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RowActionsProps {
  onDelete?: () => void;
  onDuplicate?: () => void;
  detailUrl?: string;
}

/**
 * תפריט פעולות לשורה
 */
export function RowActions({ onDelete, onDuplicate, detailUrl }: RowActionsProps) {
  if (!onDelete && !onDuplicate && !detailUrl) return null;

  const showSeparator = (detailUrl || onDuplicate) && onDelete;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DetailMenuItem url={detailUrl} />
        <DuplicateMenuItem onDuplicate={onDuplicate} />
        {showSeparator && <DropdownMenuSeparator />}
        <DeleteMenuItem onDelete={onDelete} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DetailMenuItem({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <DropdownMenuItem asChild>
      <a href={url}>פתח בדף מלא</a>
    </DropdownMenuItem>
  );
}

function DuplicateMenuItem({ onDuplicate }: { onDuplicate?: () => void }) {
  if (!onDuplicate) return null;
  return <DropdownMenuItem onClick={onDuplicate}>שכפל</DropdownMenuItem>;
}

function DeleteMenuItem({ onDelete }: { onDelete?: () => void }) {
  if (!onDelete) return null;
  return (
    <DropdownMenuItem onClick={onDelete} className="text-destructive">
      מחק
    </DropdownMenuItem>
  );
}
