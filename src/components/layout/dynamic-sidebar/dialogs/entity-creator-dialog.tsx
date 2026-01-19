/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
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
import { NavIcon } from '../nav-icon';
import { generateSlug } from '@/lib/utils/transliterate';

interface EntityCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: EntityCreatorData) => void;
}

export interface EntityCreatorData {
  name: string;
  namePlural: string;
  slug: string;
  icon: string;
  color: string;
}

const ICON_OPTIONS = [
  'Users', 'Building2', 'Briefcase', 'Package', 'Truck',
  'FileText', 'Calendar', 'DollarSign', 'Tag', 'Star',
  'Heart', 'Flag', 'Bookmark', 'Archive', 'Folder',
];

const COLOR_OPTIONS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export function EntityCreatorDialog({ open, onOpenChange, onSave }: EntityCreatorDialogProps) {
  const [name, setName] = useState('');
  const [namePlural, setNamePlural] = useState('');
  const [icon, setIcon] = useState('Users');
  const [color, setColor] = useState('#3B82F6');

  const handleSave = () => {
    if (!name.trim() || !namePlural.trim()) return;
    onSave({
      name: name.trim(),
      namePlural: namePlural.trim(),
      slug: generateSlug(name),
      icon,
      color,
    });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName('');
    setNamePlural('');
    setIcon('Users');
    setColor('#3B82F6');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>צור ישות חדשה</DialogTitle>
        </DialogHeader>
        <EntityForm
          name={name}
          namePlural={namePlural}
          icon={icon}
          color={color}
          onNameChange={setName}
          onNamePluralChange={setNamePlural}
          onIconChange={setIcon}
          onColorChange={setColor}
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !namePlural.trim()}>צור ישות</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EntityFormProps {
  name: string;
  namePlural: string;
  icon: string;
  color: string;
  onNameChange: (v: string) => void;
  onNamePluralChange: (v: string) => void;
  onIconChange: (v: string) => void;
  onColorChange: (v: string) => void;
}

function EntityForm(props: EntityFormProps) {
  const { name, namePlural, icon, color } = props;
  const { onNameChange, onNamePluralChange, onIconChange, onColorChange } = props;

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">שם (יחיד)</Label>
        <Input id="name" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="ספק משנה" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="namePlural">שם (רבים)</Label>
        <Input id="namePlural" value={namePlural} onChange={(e) => onNamePluralChange(e.target.value)} placeholder="ספקי משנה" />
      </div>
      <IconPicker selected={icon} color={color} onSelect={onIconChange} />
      <ColorPicker selected={color} onSelect={onColorChange} />
    </div>
  );
}

function IconPicker({ selected, color, onSelect }: { selected: string; color: string; onSelect: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>אייקון</Label>
      <div className="flex flex-wrap gap-2">
        {ICON_OPTIONS.map((iconName) => (
          <button
            key={iconName}
            type="button"
            onClick={() => onSelect(iconName)}
            className={`p-2 rounded-lg border-2 transition-colors ${selected === iconName ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-100'}`}
            style={selected === iconName ? { color } : undefined}
          >
            <NavIcon name={iconName} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorPicker({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>צבע</Label>
      <div className="flex flex-wrap gap-2">
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onSelect(c)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${selected === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}
