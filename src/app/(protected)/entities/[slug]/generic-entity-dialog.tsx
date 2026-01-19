/* eslint-disable max-lines-per-function */
'use client';

import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FieldInput } from '@/components/generic-table/fields';
import type { CustomFieldType, FieldOption } from '@/components/generic-table/fields';
import type { EntityType } from '@prisma/client';
import { useEntityForm } from './use-entity-form';

interface FieldDef {
  id: string;
  fieldKey: string;
  name: string;
  fieldType: CustomFieldType;
  options?: FieldOption[] | null;
  isRequired: boolean;
}

interface GenericEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: EntityType;
  editingId: string | null;
  onSuccess: () => void;
}

export function GenericEntityDialog({
  open,
  onOpenChange,
  entityType,
  editingId,
  onSuccess,
}: GenericEntityDialogProps) {
  const {
    name,
    setName,
    formData,
    updateField,
    fields,
    handleSave,
    isPending,
    isEdit,
  } = useEntityForm({ entityType, editingId, open, onSuccess });

  const hasFields = fields && fields.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={hasFields ? 'sm:max-w-[500px]' : 'sm:max-w-[425px]'} dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `עריכת ${entityType.name}` : `הוספת ${entityType.name}`}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className={hasFields ? 'max-h-[60vh]' : ''}>
          <div className="space-y-4 py-4 px-1">
            {/* Name field - always first */}
            <div className="space-y-2">
              <Label htmlFor="entity-name">
                שם <span className="text-destructive">*</span>
              </Label>
              <Input
                id="entity-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`הזן שם ${entityType.name}`}
              />
            </div>

            {/* Custom fields */}
            {(fields as FieldDef[] | undefined)?.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label>
                  {field.name}
                  {field.isRequired && <span className="text-destructive"> *</span>}
                </Label>
                <FieldInput
                  type={field.fieldType}
                  value={formData[field.fieldKey] ?? null}
                  onChange={(val) => updateField(field.fieldKey, val)}
                  options={field.options ?? []}
                  placeholder={`הזן ${field.name}`}
                  autoFocus={false}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            {isEdit ? 'שמור' : 'הוסף'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
