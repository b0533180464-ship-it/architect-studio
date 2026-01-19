'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FieldInputProps } from './types';

export function MultiSelectFieldInput({
  value,
  onChange,
  options = [],
  disabled,
  placeholder,
  className,
}: FieldInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedValues = (value as string[]) || [];

  const toggleOption = (optValue: string) => {
    const newValue = selectedValues.includes(optValue)
      ? selectedValues.filter((v) => v !== optValue)
      : [...selectedValues, optValue];
    onChange(newValue);
  };

  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('h-auto min-h-8 justify-start text-right font-normal flex-wrap gap-1', className)}
          disabled={disabled}
        >
          {selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <Badge
                key={opt.value}
                variant="secondary"
                style={opt.color ? { backgroundColor: opt.color, color: '#fff' } : undefined}
              >
                {opt.label}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder || 'בחר...'}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="flex flex-col gap-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded text-sm text-right w-full',
                'hover:bg-muted transition-colors',
                selectedValues.includes(opt.value) && 'bg-muted'
              )}
              onClick={() => toggleOption(opt.value)}
            >
              <div className={cn(
                'w-4 h-4 border rounded flex items-center justify-center',
                selectedValues.includes(opt.value) && 'bg-primary border-primary'
              )}>
                {selectedValues.includes(opt.value) && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              {opt.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
              )}
              <span className="flex-1">{opt.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
