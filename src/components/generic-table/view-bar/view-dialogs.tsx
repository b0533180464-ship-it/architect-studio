'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface CreateViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  isShared: boolean;
  onSharedChange: (shared: boolean) => void;
  onSubmit: () => void;
}

export function CreateViewDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  isShared,
  onSharedChange,
  onSubmit,
}: CreateViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>תצוגה חדשה</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="view-name">שם התצוגה</Label>
            <Input
              id="view-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="לדוגמה: פרויקטים פעילים"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="view-shared"
              checked={isShared}
              onCheckedChange={(checked) => onSharedChange(Boolean(checked))}
            />
            <Label htmlFor="view-shared" className="font-normal">
              שתף עם כל הצוות
            </Label>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={onSubmit} disabled={!name.trim()}>
            צור תצוגה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DuplicateViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
}

export function DuplicateViewDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  onSubmit,
}: DuplicateViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>שכפול תצוגה</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="duplicate-name">שם התצוגה החדשה</Label>
            <Input
              id="duplicate-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={onSubmit} disabled={!name.trim()}>
            שכפל
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewName: string;
  onConfirm: () => void;
}

export function DeleteViewDialog({
  open,
  onOpenChange,
  viewName,
  onConfirm,
}: DeleteViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>מחיקת תצוגה</DialogTitle>
          <DialogDescription>
            האם אתה בטוח שברצונך למחוק את התצוגה &quot;{viewName}&quot;?
            פעולה זו לא ניתנת לביטול.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            מחק תצוגה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
