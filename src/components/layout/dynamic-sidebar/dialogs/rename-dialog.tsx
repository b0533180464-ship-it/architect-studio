/* eslint-disable max-lines-per-function */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { NavigationItemWithChildren } from '../types';

interface RenameDialogProps {
  item: NavigationItemWithChildren | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, label: string) => void;
}

export function RenameDialog({ item, open, onOpenChange, onSave }: RenameDialogProps) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (item) setLabel(item.label);
  }, [item]);

  const handleSave = () => {
    if (item && label.trim()) {
      onSave(item.id, label.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>שינוי שם</DialogTitle>
          <DialogDescription>הזן שם חדש לפריט הניווט</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="nav-label">שם</Label>
          <Input
            id="nav-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-2"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
          <Button onClick={handleSave} disabled={!label.trim()}>שמור</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
