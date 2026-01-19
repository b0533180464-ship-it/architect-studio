'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import type { Tenant, User } from '@prisma/client';

interface Props {
  tenant: Tenant | null | undefined;
  user: Partial<User> | null | undefined;
}

interface PrivacySettings {
  showOnlineStatus: boolean;
  showCurrentActivity: boolean;
}

const DEFAULT_SETTINGS: PrivacySettings = {
  showOnlineStatus: true,
  showCurrentActivity: true,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-lines-per-function
export function PrivacyTab(_props: Props) {
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_SETTINGS);
  const [message, setMessage] = useState('');

  const { data: userSettings } = trpc.settings.getAll.useQuery();
  const mutation = trpc.settings.updatePrivacy.useMutation({
    onSuccess: () => {
      setMessage('ההגדרות נשמרו בהצלחה');
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (err) => setMessage(`שגיאה: ${err.message}`),
  });

  useEffect(() => {
    if (userSettings?.privacy) {
      setSettings({ ...DEFAULT_SETTINGS, ...userSettings.privacy } as PrivacySettings);
    }
  }, [userSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(settings);
  };

  const toggle = (field: keyof PrivacySettings) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">הגדרות פרטיות</h2>
        <p className="text-sm text-muted-foreground">שלוט במידע שאחרים יכולים לראות עליך</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-medium">הצג סטטוס מחובר</div>
              <div className="text-sm text-muted-foreground">
                אפשר לאחרים לראות כשאתה מחובר למערכת
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showOnlineStatus}
              onChange={() => toggle('showOnlineStatus')}
              className="h-5 w-5 rounded border-gray-300"
            />
          </label>
        </div>

        <div className="rounded-lg border p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-medium">הצג פעילות נוכחית</div>
              <div className="text-sm text-muted-foreground">
                אפשר לאחרים לראות על מה אתה עובד כרגע
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showCurrentActivity}
              onChange={() => toggle('showCurrentActivity')}
              className="h-5 w-5 rounded border-gray-300"
            />
          </label>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4">
        <h3 className="font-medium mb-2">מידע לגבי פרטיות</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• הנתונים שלך נשמרים בצורה מאובטחת</li>
          <li>• רק חברי הצוות במשרד שלך יכולים לראות את המידע שאתה בוחר לשתף</li>
          <li>• אתה יכול לשנות את ההגדרות האלו בכל עת</li>
        </ul>
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
