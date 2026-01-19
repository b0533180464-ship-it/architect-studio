/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ColorPicker } from '@/components/ui/color-picker';
import { IconPicker } from '@/components/ui/icon-picker';
import type { ConfigurableEntityType } from '@/server/routers/config/schemas';

interface Props {
  entityType: ConfigurableEntityType;
  onClose: () => void;
}

export function ConfigEntityForm({ entityType, onClose }: Props) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [icon, setIcon] = useState('');

  const utils = trpc.useUtils();
  const mutation = trpc.config.create.useMutation({
    onSuccess: () => {
      void utils.config.list.invalidate({ entityType });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      entityType,
      code: code || undefined,
      name,
      nameEn: nameEn || undefined,
      description: description || undefined,
      color: color || undefined,
      icon: icon || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-muted/30 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">שם (עברית) *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="שם" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameEn">שם (אנגלית)</Label>
          <Input id="nameEn" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Name" dir="ltr" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">קוד</Label>
          <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="active" dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label>תיאור</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="תיאור קצר..." rows={2} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>צבע</Label>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        <div className="space-y-2">
          <Label>אייקון</Label>
          <IconPicker value={icon} onChange={setIcon} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>ביטול</Button>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'שומר...' : 'הוסף'}</Button>
      </div>
    </form>
  );
}
