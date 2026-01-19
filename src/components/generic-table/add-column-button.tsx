'use client';

import { useState } from 'react';
import { Plus, Type, Hash, Calendar, ToggleLeft, List, Link2, Mail, Phone, DollarSign, FileText, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SelectOptionsEditor, type SelectOption } from './select-options-editor';
import type { CustomFieldType } from '@/server/routers/customFields/schemas';
import type { RelationType } from '@/server/routers/relations/schemas';

export interface AddColumnData {
  fieldType: CustomFieldType;
  name: string;
  fieldKey: string;
  options?: SelectOption[];
}

export interface AddRelationData {
  name: string;
  fieldKey: string;
  targetEntityTypes: string[];
  relationType: RelationType;
  isBidirectional: boolean;
  inverseName?: string;
}

interface EntityTypeOption {
  slug: string;
  name: string;
}

interface AddColumnButtonProps {
  onAdd: (data: AddColumnData) => void;
  onAddRelation?: (data: AddRelationData) => void;
  entityTypes?: EntityTypeOption[];
  sourceEntityType?: string;
  disabled?: boolean;
  className?: string;
}

type FieldTypeOrRelation = CustomFieldType | 'relation';

const FIELD_TYPES: {
  type: FieldTypeOrRelation;
  label: string;
  icon: typeof Type;
  description: string;
}[] = [
  { type: 'text', label: 'טקסט', icon: Type, description: 'שדה טקסט קצר' },
  { type: 'textarea', label: 'טקסט ארוך', icon: FileText, description: 'שדה טקסט מרובה שורות' },
  { type: 'number', label: 'מספר', icon: Hash, description: 'ערך מספרי' },
  { type: 'currency', label: 'מטבע', icon: DollarSign, description: 'סכום כספי' },
  { type: 'date', label: 'תאריך', icon: Calendar, description: 'בחירת תאריך' },
  { type: 'datetime', label: 'תאריך ושעה', icon: Calendar, description: 'תאריך עם שעה' },
  { type: 'boolean', label: 'סימון', icon: ToggleLeft, description: 'כן/לא' },
  { type: 'select', label: 'בחירה', icon: List, description: 'בחירה מרשימה' },
  { type: 'multiselect', label: 'בחירה מרובה', icon: List, description: 'בחירת מספר ערכים' },
  { type: 'url', label: 'קישור', icon: Link2, description: 'כתובת URL' },
  { type: 'email', label: 'דוא"ל', icon: Mail, description: 'כתובת אימייל' },
  { type: 'phone', label: 'טלפון', icon: Phone, description: 'מספר טלפון' },
  { type: 'user', label: 'משתמש', icon: User, description: 'בחירת משתמש אחד' },
  { type: 'users', label: 'משתמשים', icon: Users, description: 'בחירת מספר משתמשים' },
  { type: 'relation', label: 'קשר לישות', icon: Link2, description: 'קשר לישות אחרת' },
];

const RELATION_TYPES: { value: RelationType; label: string }[] = [
  { value: 'many_to_many', label: 'רבים לרבים' },
  { value: 'one_to_many', label: 'אחד לרבים' },
  { value: 'one_to_one', label: 'אחד לאחד' },
];

function generateFieldKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50) || 'custom_field';
}

export function AddColumnButton({
  onAdd, onAddRelation, entityTypes = [], sourceEntityType, disabled, className,
}: AddColumnButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FieldTypeOrRelation | null>(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [targetEntityTypes, setTargetEntityTypes] = useState<string[]>([]);
  const [relationType, setRelationType] = useState<RelationType>('many_to_many');
  const [isBidirectional, setIsBidirectional] = useState(false);
  const [inverseName, setInverseName] = useState('');

  const isSelectType = selectedType === 'select' || selectedType === 'multiselect';
  const isRelationType = selectedType === 'relation';
  const availableEntityTypes = entityTypes.filter((et) => et.slug !== sourceEntityType);

  const handleSelectType = (type: FieldTypeOrRelation) => {
    // Disable relation if no entity types available
    if (type === 'relation' && (!onAddRelation || availableEntityTypes.length === 0)) return;
    setSelectedType(type);
    setFieldName('');
    setFieldKey('');
    setOptions([]);
    setTargetEntityTypes([]);
    setRelationType('many_to_many');
    setIsBidirectional(false);
    setInverseName('');
    setIsOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFieldName(name);
    setFieldKey(generateFieldKey(name));
  };

  const handleSubmit = () => {
    if (!selectedType || !fieldName.trim() || !fieldKey.trim()) return;
    if (isSelectType && options.length === 0) return;
    if (isRelationType && targetEntityTypes.length === 0) return;

    if (isRelationType && onAddRelation) {
      onAddRelation({
        name: fieldName.trim(),
        fieldKey: fieldKey.trim(),
        targetEntityTypes,
        relationType,
        isBidirectional,
        inverseName: isBidirectional ? inverseName.trim() || undefined : undefined,
      });
    } else if (!isRelationType) {
      onAdd({
        fieldType: selectedType as CustomFieldType,
        name: fieldName.trim(),
        fieldKey: fieldKey.trim(),
        options: isSelectType ? options : undefined,
      });
    }
    setIsOpen(false);
    setSelectedType(null);
  };

  const toggleTargetType = (slug: string) => {
    setTargetEntityTypes((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    );
  };

  const isSubmitDisabled = !fieldName.trim() || !fieldKey.trim() ||
    (isSelectType && options.length === 0) || (isRelationType && targetEntityTypes.length === 0);

  const selectedTypeInfo = FIELD_TYPES.find(t => t.type === selectedType);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-full px-3 rounded-none border-l border-border/50',
              'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              className
            )}
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            הוסף עמודה חדשה
          </div>
          <DropdownMenuSeparator />
          {FIELD_TYPES.map((field) => {
            const isRelationDisabled = field.type === 'relation' &&
              (!onAddRelation || availableEntityTypes.length === 0);
            return (
              <DropdownMenuItem
                key={field.type}
                onClick={() => handleSelectType(field.type)}
                className="flex items-center gap-2"
                disabled={isRelationDisabled}
              >
                <field.icon className="h-4 w-4 text-muted-foreground" />
                <span>{field.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTypeInfo && (
                <>
                  <selectedTypeInfo.icon className="h-5 w-5" />
                  <span>הוסף עמודת {selectedTypeInfo.label}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="field-name">שם השדה</Label>
              <Input
                id="field-name"
                value={fieldName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="לדוגמה: מספר הזמנה"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="field-key">מזהה (באנגלית)</Label>
              <Input
                id="field-key"
                value={fieldKey}
                onChange={(e) => setFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="order_number"
                dir="ltr"
                className="text-left"
              />
              <p className="text-xs text-muted-foreground">
                מזהה ייחודי לשימוש פנימי. אותיות קטנות, מספרים וקו תחתון בלבד.
              </p>
            </div>
            {isSelectType && (
              <SelectOptionsEditor options={options} onChange={setOptions} />
            )}
            {isRelationType && (
              <>
                <div className="grid gap-2">
                  <Label>לוחות יעד (ניתן לבחור כמה)</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                    {availableEntityTypes.map((et) => (
                      <label
                        key={et.slug}
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                      >
                        <Checkbox
                          checked={targetEntityTypes.includes(et.slug)}
                          onCheckedChange={() => toggleTargetType(et.slug)}
                        />
                        <span className="text-sm">{et.name}</span>
                      </label>
                    ))}
                  </div>
                  {targetEntityTypes.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      נבחרו: {targetEntityTypes.length} לוחות
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>סוג קשר</Label>
                  <Select value={relationType} onValueChange={(v) => setRelationType(v as RelationType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RELATION_TYPES.map((rt) => (
                        <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-t pt-3 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isBidirectional}
                      onCheckedChange={(checked) => setIsBidirectional(checked === true)}
                    />
                    <span className="text-sm">קשר דו-כיווני</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 mr-6">
                    ייצור עמודה גם בלוחות היעד שתציג את הקשר בכיוון ההפוך
                  </p>
                </div>
                {isBidirectional && (
                  <div className="grid gap-2">
                    <Label htmlFor="inverse-name">שם העמודה ההפוכה</Label>
                    <Input
                      id="inverse-name"
                      value={inverseName}
                      onChange={(e) => setInverseName(e.target.value)}
                      placeholder={sourceEntityType ? `לדוגמה: ${entityTypes.find(e => e.slug === sourceEntityType)?.name || sourceEntityType}` : ''}
                    />
                    <p className="text-xs text-muted-foreground">
                      השם שיופיע בלוחות היעד. אם ריק, ישתמש בשם הלוח הנוכחי.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
              {isRelationType ? 'הוסף קשר' : 'הוסף עמודה'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
