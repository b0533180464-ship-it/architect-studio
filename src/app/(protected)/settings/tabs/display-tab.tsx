/* eslint-disable max-lines */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/components/providers/theme-provider';
import type { Tenant, User } from '@prisma/client';

interface Props {
  tenant: Tenant | null | undefined;
  user: Partial<User> | null | undefined;
}

interface DisplaySettings {
  language: 'he' | 'en';
  theme: 'light' | 'dark' | 'system';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '24h' | '12h';
  timezone: string;
  startOfWeek: 'sunday' | 'monday';
  currency: string;
}

const DEFAULT_SETTINGS: DisplaySettings = {
  language: 'he',
  theme: 'system',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  timezone: 'Asia/Jerusalem',
  startOfWeek: 'sunday',
  currency: 'ILS',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-lines-per-function
export function DisplayTab(_props: Props) {
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_SETTINGS);
  const [message, setMessage] = useState('');
  const { theme, setTheme } = useTheme();

  const { data: userSettings } = trpc.settings.getAll.useQuery();
  const mutation = trpc.settings.updateDisplay.useMutation({
    onSuccess: () => {
      setMessage('ההגדרות נשמרו בהצלחה');
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (err) => setMessage(`שגיאה: ${err.message}`),
  });

  // Sync local settings with theme context
  useEffect(() => {
    if (settings.theme !== theme) {
      setSettings((prev) => ({ ...prev, theme }));
    }
  }, [theme, settings.theme]);

  useEffect(() => {
    if (userSettings?.display) {
      const displaySettings = { ...DEFAULT_SETTINGS, ...userSettings.display } as DisplaySettings;
      setSettings(displaySettings);
      // Apply saved theme
      if (displaySettings.theme) {
        setTheme(displaySettings.theme);
      }
    }
  }, [userSettings, setTheme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(settings);
  };

  const updateField = <K extends keyof DisplaySettings>(field: K, value: DisplaySettings[K]) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    // Apply theme immediately when changed
    if (field === 'theme') {
      setTheme(value as DisplaySettings['theme']);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">הגדרות תצוגה</h2>
        <p className="text-sm text-muted-foreground">התאם את מראה המערכת להעדפותיך</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Language */}
        <div className="space-y-2">
          <Label>שפה</Label>
          <select
            value={settings.language}
            onChange={(e) => updateField('language', e.target.value as DisplaySettings['language'])}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="he">עברית</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <Label>ערכת נושא</Label>
          <select
            value={settings.theme}
            onChange={(e) => updateField('theme', e.target.value as DisplaySettings['theme'])}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="system">אוטומטי (לפי המערכת)</option>
            <option value="light">בהיר</option>
            <option value="dark">כהה</option>
          </select>
        </div>

        {/* Date Format */}
        <div className="space-y-2">
          <Label>פורמט תאריך</Label>
          <select
            value={settings.dateFormat}
            onChange={(e) => updateField('dateFormat', e.target.value as DisplaySettings['dateFormat'])}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="DD/MM/YYYY">31/12/2024</option>
            <option value="MM/DD/YYYY">12/31/2024</option>
            <option value="YYYY-MM-DD">2024-12-31</option>
          </select>
        </div>

        {/* Time Format */}
        <div className="space-y-2">
          <Label>פורמט שעה</Label>
          <select
            value={settings.timeFormat}
            onChange={(e) => updateField('timeFormat', e.target.value as DisplaySettings['timeFormat'])}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="24h">24 שעות (14:30)</option>
            <option value="12h">12 שעות (2:30 PM)</option>
          </select>
        </div>

        {/* Start of Week */}
        <div className="space-y-2">
          <Label>תחילת שבוע</Label>
          <select
            value={settings.startOfWeek}
            onChange={(e) => updateField('startOfWeek', e.target.value as DisplaySettings['startOfWeek'])}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="sunday">יום ראשון</option>
            <option value="monday">יום שני</option>
          </select>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label>מטבע ברירת מחדל</Label>
          <select
            value={settings.currency}
            onChange={(e) => updateField('currency', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="ILS">₪ שקל ישראלי</option>
            <option value="USD">$ דולר אמריקאי</option>
            <option value="EUR">€ יורו</option>
          </select>
        </div>
      </div>

      {message && (
        <p className={`text-sm ${message.includes('שגיאה') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'שומר...' : 'שמור הגדרות'}
      </Button>
    </form>
  );
}
