'use client';

import { Pencil, Palette, EyeOff, Eye, Trash2 } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import type { NavigationItemWithChildren } from './types';

interface NavContextMenuProps {
  item: NavigationItemWithChildren;
  children: React.ReactNode;
  onRename: (item: NavigationItemWithChildren) => void;
  onChangeIcon: (item: NavigationItemWithChildren) => void;
  onToggleVisibility: (item: NavigationItemWithChildren) => void;
  onDelete: (item: NavigationItemWithChildren) => void;
}

export function NavContextMenu(props: NavContextMenuProps) {
  const { item, children, onRename, onChangeIcon, onToggleVisibility, onDelete } = props;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => onRename(item)} disabled={item.isSystem}>
          <Pencil className="h-4 w-4 ml-2" />
          שנה שם
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onChangeIcon(item)} disabled={item.isSystem}>
          <Palette className="h-4 w-4 ml-2" />
          שנה אייקון
        </ContextMenuItem>
        <ContextMenuSeparator />
        <VisibilityMenuItem item={item} onToggle={onToggleVisibility} />
        {!item.isSystem && <DeleteMenuItem item={item} onDelete={onDelete} />}
      </ContextMenuContent>
    </ContextMenu>
  );
}

function VisibilityMenuItem({ item, onToggle }: { item: NavigationItemWithChildren; onToggle: (i: NavigationItemWithChildren) => void }) {
  return (
    <ContextMenuItem onClick={() => onToggle(item)}>
      {item.isVisible ? <><EyeOff className="h-4 w-4 ml-2" />הסתר</> : <><Eye className="h-4 w-4 ml-2" />הצג</>}
    </ContextMenuItem>
  );
}

function DeleteMenuItem({ item, onDelete }: { item: NavigationItemWithChildren; onDelete: (i: NavigationItemWithChildren) => void }) {
  return (
    <>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => onDelete(item)} className="text-red-600 focus:text-red-600">
        <Trash2 className="h-4 w-4 ml-2" />
        מחק
      </ContextMenuItem>
    </>
  );
}
