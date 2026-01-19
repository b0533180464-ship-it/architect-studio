/* eslint-disable max-lines-per-function */
'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type RecurrenceEndType = 'occurrences' | 'date';

export interface RecurrenceData {
  enabled: boolean;
  frequency: RecurrenceFrequency;
  endType: RecurrenceEndType;
  occurrences: number;
  endDate: string;
}

interface RecurrenceSelectorProps {
  value: RecurrenceData;
  onChange: (value: RecurrenceData) => void;
}

const FREQUENCY_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'daily', label: 'כל יום' },
  { value: 'weekly', label: 'כל שבוע' },
  { value: 'biweekly', label: 'כל שבועיים' },
  { value: 'monthly', label: 'כל חודש' },
];

export function RecurrenceSelector({ value, onChange }: RecurrenceSelectorProps) {
  const handleEnabledChange = (enabled: boolean) => {
    onChange({ ...value, enabled });
  };

  const handleFrequencyChange = (frequency: RecurrenceFrequency) => {
    onChange({ ...value, frequency });
  };

  const handleEndTypeChange = (endType: RecurrenceEndType) => {
    onChange({ ...value, endType });
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="recurrence-enabled"
          checked={value.enabled}
          onChange={(e) => handleEnabledChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="recurrence-enabled" className="cursor-pointer font-medium">
          פגישה חוזרת
        </Label>
      </div>

      {value.enabled && (
        <>
          <div className="space-y-2">
            <Label>תדירות</Label>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCY_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={`freq-${opt.value}`}
                    checked={value.frequency === opt.value}
                    onChange={() => handleFrequencyChange(opt.value)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={`freq-${opt.value}`} className="cursor-pointer">{opt.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>סיום</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="end-occurrences"
                  checked={value.endType === 'occurrences'}
                  onChange={() => handleEndTypeChange('occurrences')}
                  className="h-4 w-4"
                />
                <Label htmlFor="end-occurrences" className="cursor-pointer">אחרי</Label>
                <Input
                  type="number"
                  min={2}
                  max={52}
                  value={value.occurrences}
                  onChange={(e) => onChange({ ...value, occurrences: parseInt(e.target.value) || 2 })}
                  disabled={value.endType !== 'occurrences'}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">פעמים</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="end-date"
                  checked={value.endType === 'date'}
                  onChange={() => handleEndTypeChange('date')}
                  className="h-4 w-4"
                />
                <Label htmlFor="end-date" className="cursor-pointer">בתאריך</Label>
                <Input
                  type="date"
                  value={value.endDate}
                  onChange={(e) => onChange({ ...value, endDate: e.target.value })}
                  disabled={value.endType !== 'date'}
                  className="w-40"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
