/* eslint-disable max-lines-per-function */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NavIcon, availableIcons } from '../nav-icon';
import type { NavigationItemWithChildren } from '../types';

interface IconDialogProps {
  item: NavigationItemWithChildren | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, icon: string) => void;
}

export function IconDialog({ item, open, onOpenChange, onSave }: IconDialogProps) {
  const [selectedIcon, setSelectedIcon] = useState<string>('');

  useEffect(() => {
    if (item?.icon) setSelectedIcon(item.icon);
  }, [item]);

  const handleSave = () => {
    if (item && selectedIcon) {
      onSave(item.id, selectedIcon);
      onOpenChange(false);
    }
  };

  const iconButtonClass = (iconName: string) =>
    `p-3 rounded-lg border transition-colors ${
      selectedIcon === iconName
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300'
    }`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>בחירת אייקון</DialogTitle>
          <DialogDescription>בחר אייקון עבור פריט הניווט</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-6 gap-2 py-4 max-h-[300px] overflow-y-auto">
          {availableIcons.map((iconName) => (
            <button
              key={iconName}
              onClick={() => setSelectedIcon(iconName)}
              className={iconButtonClass(iconName)}
            >
              <NavIcon name={iconName} className="h-5 w-5 mx-auto" />
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
          <Button onClick={handleSave} disabled={!selectedIcon}>שמור</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
