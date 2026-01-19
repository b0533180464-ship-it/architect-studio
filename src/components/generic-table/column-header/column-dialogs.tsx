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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SelectOptionsEditor, type SelectOption } from '../select-options-editor';
import type { RelationType } from '@/server/routers/relations/schemas';
import type { EntityTypeOption } from './types';

interface EditLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  onLabelChange: (label: string) => void;
  onSubmit: () => void;
}

export function EditLabelDialog({
  open,
  onOpenChange,
  label,
  onLabelChange,
  onSubmit,
}: EditLabelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת שם עמודה</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-label">שם העמודה</Label>
            <Input
              id="edit-label"
              value={label}
              onChange={(e) => onLabelChange(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={onSubmit} disabled={!label.trim()}>
            שמור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnLabel: string;
  options: SelectOption[];
  onOptionsChange: (options: SelectOption[]) => void;
  onSubmit: () => void;
}

export function EditOptionsDialog({
  open,
  onOpenChange,
  columnLabel,
  options,
  onOptionsChange,
  onSubmit,
}: EditOptionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת אפשרויות - {columnLabel}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <SelectOptionsEditor options={options} onChange={onOptionsChange} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={onSubmit} disabled={options.length === 0}>
            שמור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnLabel: string;
  onConfirm: () => void;
}

export function DeleteColumnDialog({
  open,
  onOpenChange,
  columnLabel,
  onConfirm,
}: DeleteColumnDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>מחיקת עמודה</DialogTitle>
          <DialogDescription>
            האם אתה בטוח שברצונך למחוק את העמודה &quot;{columnLabel}&quot;?
            פעולה זו תמחק את כל הנתונים בעמודה ולא ניתן לשחזר אותם.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            מחק עמודה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const RELATION_TYPES: { value: RelationType; label: string }[] = [
  { value: 'many_to_many', label: 'רבים לרבים' },
  { value: 'one_to_many', label: 'אחד לרבים' },
  { value: 'one_to_one', label: 'אחד לאחד' },
];

interface EditRelationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnLabel: string;
  targetEntityTypes: string[];
  onTargetChange: (targets: string[]) => void;
  relationType: RelationType;
  onRelationTypeChange: (type: RelationType) => void;
  entityTypes: EntityTypeOption[];
  onSubmit: () => void;
}

export function EditRelationSettingsDialog({
  open, onOpenChange, columnLabel, targetEntityTypes, onTargetChange,
  relationType, onRelationTypeChange, entityTypes, onSubmit,
}: EditRelationSettingsDialogProps) {
  const toggleTarget = (slug: string) => {
    if (targetEntityTypes.includes(slug)) {
      onTargetChange(targetEntityTypes.filter((t) => t !== slug));
    } else {
      onTargetChange([...targetEntityTypes, slug]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>ערוך הגדרות קשר - {columnLabel}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>מקושר לישויות</Label>
            <ScrollArea className="h-32 border rounded-md p-2">
              <div className="space-y-2">
                {entityTypes.map((et) => (
                  <label key={et.slug} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={targetEntityTypes.includes(et.slug)}
                      onCheckedChange={() => toggleTarget(et.slug)}
                    />
                    <span className="text-sm">{et.name}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>
            {targetEntityTypes.length === 0 && (
              <p className="text-xs text-destructive">יש לבחור לפחות ישות אחת</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>סוג קשר</Label>
            <Select value={relationType} onValueChange={(v) => onRelationTypeChange(v as RelationType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RELATION_TYPES.map((rt) => (
                  <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
          <Button onClick={onSubmit} disabled={targetEntityTypes.length === 0}>שמור</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
