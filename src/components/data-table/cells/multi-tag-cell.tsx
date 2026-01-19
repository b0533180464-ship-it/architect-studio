'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MultiTagCellProps { value: string[]; onSave: (value: string[]) => void; disabled?: boolean; placeholder?: string }

/**
 * תא תגיות מרובות
 */
export function MultiTagCell({ value, onSave, disabled, placeholder }: MultiTagCellProps) {
  const [open, setOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  const addTag = () => { const t = newTag.trim(); if (t && !value.includes(t)) { onSave([...value, t]); setNewTag(''); } };
  const removeTag = (tag: string) => onSave(value.filter((t) => t !== tag));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={cn('h-8 px-2 gap-1', value.length === 0 && 'text-muted-foreground')} disabled={disabled}>
          <span className="text-xs">{value.length > 0 ? `${value.length} תגיות` : placeholder || 'הוסף תגיות'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <TagEditor tags={value} newTag={newTag} setNewTag={setNewTag} addTag={addTag} removeTag={removeTag} />
      </PopoverContent>
    </Popover>
  );
}

function TagEditor({ tags, newTag, setNewTag, addTag, removeTag }: { tags: string[]; newTag: string; setNewTag: (v: string) => void; addTag: () => void; removeTag: (t: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap">{tags.map((tag) => <TagBadge key={tag} tag={tag} onRemove={() => removeTag(tag)} />)}</div>
      <div className="flex gap-1">
        <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="תגית חדשה..." className="h-8 text-sm" dir="rtl" />
        <Button size="sm" variant="ghost" onClick={addTag} className="h-8 px-2"><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function TagBadge({ tag, onRemove }: { tag: string; onRemove: () => void }) {
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs">{tag}<button type="button" onClick={onRemove} className="hover:text-destructive"><X className="h-3 w-3" /></button></span>;
}
