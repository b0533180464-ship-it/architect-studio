/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RelationType } from '@/server/routers/relations/schemas';

export interface AddRelationData {
  name: string;
  fieldKey: string;
  targetEntityType: string;
  relationType: RelationType;
  isBidirectional: boolean;
  inverseName?: string;
}

interface EntityTypeOption {
  slug: string;
  name: string;
}

interface AddRelationFormProps {
  entityTypes: EntityTypeOption[];
  onSubmit: (data: AddRelationData) => void;
  onCancel: () => void;
}

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
    .substring(0, 50) || 'relation';
}

export function AddRelationForm({ entityTypes, onSubmit, onCancel }: AddRelationFormProps) {
  const [name, setName] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [targetEntityType, setTargetEntityType] = useState('');
  const [relationType, setRelationType] = useState<RelationType>('many_to_many');

  const handleNameChange = (value: string) => {
    setName(value);
    setFieldKey(generateFieldKey(value));
  };

  const handleSubmit = () => {
    if (!name.trim() || !fieldKey.trim() || !targetEntityType) return;
    onSubmit({
      name: name.trim(),
      fieldKey: fieldKey.trim(),
      targetEntityType,
      relationType,
      isBidirectional: false,
    });
  };

  const isSubmitDisabled = !name.trim() || !fieldKey.trim() || !targetEntityType;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          <span>הוסף עמודת קשר</span>
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="relation-name">שם הקשר</Label>
          <Input
            id="relation-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder='לדוגמה: "ספקים קשורים"'
            autoFocus
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="relation-key">מזהה (באנגלית)</Label>
          <Input
            id="relation-key"
            value={fieldKey}
            onChange={(e) => setFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="related_suppliers"
            dir="ltr"
            className="text-left"
          />
        </div>
        <div className="grid gap-2">
          <Label>סוג ישות יעד</Label>
          <Select value={targetEntityType} onValueChange={setTargetEntityType}>
            <SelectTrigger>
              <SelectValue placeholder="בחר ישות יעד" />
            </SelectTrigger>
            <SelectContent>
              {entityTypes.map((et) => (
                <SelectItem key={et.slug} value={et.slug}>
                  {et.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>סוג קשר</Label>
          <Select value={relationType} onValueChange={(v) => setRelationType(v as RelationType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RELATION_TYPES.map((rt) => (
                <SelectItem key={rt.value} value={rt.value}>
                  {rt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          ביטול
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
          הוסף קשר
        </Button>
      </div>
    </>
  );
}
