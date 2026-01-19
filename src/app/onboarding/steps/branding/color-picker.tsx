'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const COLOR_PRESETS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2'];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label>צבע ראשי</Label>
      <div className="flex flex-wrap gap-3">
        {COLOR_PRESETS.map((color) => (
          <ColorButton key={color} color={color} selected={value === color} onClick={() => onChange(color)} />
        ))}
        <Input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-10 cursor-pointer rounded-full p-0" />
      </div>
    </div>
  );
}

interface ColorButtonProps {
  color: string;
  selected: boolean;
  onClick: () => void;
}

function ColorButton({ color, selected, onClick }: ColorButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 w-10 rounded-full border-2 transition-all ${selected ? 'border-foreground scale-110' : 'border-transparent'}`}
      style={{ backgroundColor: color }}
    />
  );
}
