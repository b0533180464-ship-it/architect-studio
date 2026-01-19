/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColorPicker } from '@/components/ui/color-picker';
import { IconPicker, getIcon } from '@/components/ui/icon-picker';
import { Pencil, Trash2, GripVertical, X, Check } from 'lucide-react';
import type { RouterOutputs } from '@/lib/trpc';

type ConfigEntity = RouterOutputs['config']['list'][number];

interface Props {
  entity: ConfigEntity;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

function EditMode({ entity, onCancel }: { entity: ConfigEntity; onCancel: () => void }) {
  const [name, setName] = useState(entity.name);
  const [color, setColor] = useState(entity.color || '');
  const [icon, setIcon] = useState(entity.icon || '');
  const utils = trpc.useUtils();

  const updateMutation = trpc.config.update.useMutation({
    onSuccess: () => {
      void utils.config.list.invalidate();
      onCancel();
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: entity.id,
      name,
      color: color || null,
      icon: icon || null,
    });
  };

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם" />
      <div className="grid gap-3 md:grid-cols-2">
        <ColorPicker value={color} onChange={setColor} />
        <IconPicker value={icon} onChange={setIcon} />
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="ml-1 h-4 w-4" />
          ביטול
        </Button>
        <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
          <Check className="ml-1 h-4 w-4" />
          {updateMutation.isPending ? 'שומר...' : 'שמור'}
        </Button>
      </div>
    </div>
  );
}

export function ConfigEntityItem({ entity, dragHandleProps }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const utils = trpc.useUtils();
  const deleteMutation = trpc.config.delete.useMutation({
    onSuccess: () => void utils.config.list.invalidate(),
  });

  if (isEditing) {
    return <EditMode entity={entity} onCancel={() => setIsEditing(false)} />;
  }

  const Icon = entity.icon ? getIcon(entity.icon) : null;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card p-3 hover:bg-muted/50">
      <div {...dragHandleProps} className="cursor-grab touch-none">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      {entity.color && (
        <div className="h-4 w-4 shrink-0 rounded-full border" style={{ backgroundColor: entity.color }} />
      )}
      {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
      <span className="flex-1 truncate">{entity.name}</span>
      {entity.nameEn && <span className="text-xs text-muted-foreground">{entity.nameEn}</span>}
      {entity.isSystem && <span className="rounded bg-muted px-2 py-0.5 text-xs">מערכת</span>}
      {entity.isDefault && <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">ברירת מחדל</span>}
      <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          if (!entity.isSystem && confirm('האם למחוק?')) {
            deleteMutation.mutate({ id: entity.id });
          }
        }}
        disabled={entity.isSystem || deleteMutation.isPending}
        className={entity.isSystem ? 'opacity-50' : ''}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
