/* eslint-disable max-lines-per-function */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#78716C', '#64748B', '#6B7280',
];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setInputValue(color);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    onChange('');
    setInputValue('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn('w-full justify-start gap-2 font-normal', !value && 'text-muted-foreground')}
        >
          {value ? (
            <>
              <div className="h-4 w-4 rounded border" style={{ backgroundColor: value }} />
              <span>{value}</span>
            </>
          ) : (
            <span>בחר צבע...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={cn(
                  'h-8 w-8 rounded-md border-2 transition-transform hover:scale-110',
                  value === color ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="#000000"
              value={inputValue}
              onChange={handleInputChange}
              className="flex-1 font-mono text-sm"
              dir="ltr"
            />
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="h-9 w-9 cursor-pointer rounded border p-0.5"
            />
          </div>
          {value && (
            <Button variant="ghost" size="sm" className="w-full" onClick={handleClear}>
              נקה בחירה
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
