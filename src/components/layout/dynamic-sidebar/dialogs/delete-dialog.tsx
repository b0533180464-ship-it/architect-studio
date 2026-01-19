/* eslint-disable max-lines-per-function */
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { NavigationItemWithChildren } from '../types';

interface DeleteDialogProps {
  item: NavigationItemWithChildren | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
}

export function DeleteDialog({ item, open, onOpenChange, onConfirm }: DeleteDialogProps) {
  const handleConfirm = () => {
    if (item) {
      onConfirm(item.id);
      onOpenChange(false);
    }
  };

  const hasChildren = item?.children && item.children.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>מחיקת פריט ניווט</AlertDialogTitle>
          <AlertDialogDescription>
            האם למחוק את &quot;{item?.label}&quot;?
            {hasChildren && (
              <span className="block mt-2 text-red-600">
                שים לב: כל תתי הפריטים יימחקו גם כן!
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ביטול</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
            מחק
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
