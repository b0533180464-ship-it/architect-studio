'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  color: string;
}

interface SelectOptionsEditorProps {
  options: SelectOption[];
  onChange: (options: SelectOption[]) => void;
}

// Preset colors for quick selection
const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#64748b', // slate
];

export function SelectOptionsEditor({ options, onChange }: SelectOptionsEditorProps) {
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState<string>(PRESET_COLORS[0] ?? '#3b82f6');

  const handleAddOption = () => {
    if (!newLabel.trim()) return;

    const value = newLabel
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50) || `option_${options.length + 1}`;

    const newOption: SelectOption = {
      value,
      label: newLabel.trim(),
      color: newColor,
    };

    onChange([...options, newOption]);
    setNewLabel('');
    // Cycle to next color
    const currentIndex = PRESET_COLORS.indexOf(newColor);
    const nextColor = PRESET_COLORS[(currentIndex + 1) % PRESET_COLORS.length];
    setNewColor(nextColor ?? '#3b82f6');
  };

  const handleRemoveOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const handleUpdateOption = (index: number, field: 'label' | 'color', value: string) => {
    const newOptions = [...options];
    const currentOption = newOptions[index];
    if (currentOption) {
      newOptions[index] = { ...currentOption, [field]: value };
      onChange(newOptions);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  };

  return (
    <div className="space-y-4">
      <Label>אפשרויות בחירה</Label>

      {/* Existing options */}
      {options.length > 0 && (
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <ColorPicker
                value={option.color}
                onChange={(color) => handleUpdateOption(index, 'color', color)}
              />
              <Input
                value={option.label}
                onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                className="flex-1 h-8"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveOption(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new option */}
      <div className="flex items-center gap-2">
        <ColorPicker value={newColor} onChange={setNewColor} />
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="הוסף אפשרות..."
          className="flex-1 h-8"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={handleAddOption}
          disabled={!newLabel.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {options.length === 0 && (
        <p className="text-xs text-muted-foreground">
          הוסף לפחות אפשרות אחת לשדה הבחירה
        </p>
      )}
    </div>
  );
}

// Color picker component
function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          'w-8 h-8 rounded border-2 border-muted',
          'hover:border-muted-foreground transition-colors'
        )}
        style={{ backgroundColor: value }}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-10 right-0 z-50 bg-popover border rounded-lg p-2 shadow-lg">
            <div className="grid grid-cols-5 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'w-6 h-6 rounded transition-transform',
                    'hover:scale-110',
                    value === color && 'ring-2 ring-primary ring-offset-1'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color);
                    setIsOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
