'use client';

import { useState, useRef, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import type { TextareaCellProps } from '../types';

/**
 * תא טקסט ארוך - אייקון + Popover עם Textarea
 */
export function TextareaCell({ value, onSave, placeholder, disabled }: TextareaCellProps) {
  const [open, setOpen] = useState(false);
  const [editValue, setEditValue] = useState(value ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasContent = value && value.trim().length > 0;

  useEffect(() => { if (open) { setEditValue(value ?? ''); setTimeout(() => textareaRef.current?.focus(), 0); } }, [open, value]);

  const handleSave = () => { const v = editValue.trim(); onSave(v === '' ? null : v); setOpen(false); };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 gap-1" disabled={disabled}>
          <FileText className="h-4 w-4" />
          {hasContent && <span className="text-xs text-muted-foreground truncate max-w-[60px]">{value}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-2">
          <Textarea ref={textareaRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder={placeholder || 'הזן טקסט...'} className="min-h-[100px]" dir="rtl" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>ביטול</Button>
            <Button size="sm" onClick={handleSave}>שמור</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
