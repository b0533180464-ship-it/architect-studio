'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import type { Tenant, User } from '@prisma/client';

interface Props {
  tenant: Tenant | null | undefined;
  user: Partial<User> | null | undefined;
}

interface NotificationSettings {
  email: { taskAssigned: boolean; taskDue: boolean; paymentReceived: boolean; approvalNeeded: boolean; weeklyDigest: boolean; };
  push: { enabled: boolean; urgentOnly: boolean; };
  inApp: { enabled: boolean; sound: boolean; };
}

const DEFAULT_SETTINGS: NotificationSettings = {
  email: { taskAssigned: true, taskDue: true, paymentReceived: true, approvalNeeded: true, weeklyDigest: true },
  push: { enabled: true, urgentOnly: false },
  inApp: { enabled: true, sound: true },
};

export function NotificationsTab({ user }: Props) {
  const { settings, toggle, message, mutation, handleSubmit } = useNotificationForm(user);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header />
      <EmailSection settings={settings.email} toggle={(k) => toggle('email', k)} />
      <PushSection settings={settings.push} toggle={(k) => toggle('push', k)} />
      <InAppSection settings={settings.inApp} toggle={(k) => toggle('inApp', k)} />
      {message && <StatusMessage message={message} />}
      <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'שומר...' : 'שמור הגדרות'}</Button>
    </form>
  );
}

function useNotificationForm(user: Props['user']) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [message, setMessage] = useState('');
  const utils = trpc.useUtils();

  useEffect(() => {
    if (user?.notifications && typeof user.notifications === 'object') {
      const n = user.notifications as unknown as Partial<NotificationSettings>;
      setSettings({ email: { ...DEFAULT_SETTINGS.email, ...n.email }, push: { ...DEFAULT_SETTINGS.push, ...n.push }, inApp: { ...DEFAULT_SETTINGS.inApp, ...n.inApp } });
    }
  }, [user]);

  const mutation = trpc.user.updateNotifications.useMutation({
    onSuccess: () => { setMessage('ההגדרות נשמרו'); utils.user.me.invalidate(); setTimeout(() => setMessage(''), 3000); },
    onError: (err) => setMessage(`שגיאה: ${err.message}`),
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate(settings); };
  const toggle = (section: keyof NotificationSettings, key: string) => {
    const sectionData = settings[section] as Record<string, boolean>;
    setSettings({ ...settings, [section]: { ...sectionData, [key]: !sectionData[key] } });
  };

  return { settings, toggle, message, mutation, handleSubmit };
}

function StatusMessage({ message }: { message: string }) {
  return <p className={`text-sm ${message.includes('שגיאה') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>;
}

function Header() {
  return (<div><h2 className="text-lg font-semibold">התראות</h2>
    <p className="text-sm text-muted-foreground">הגדר אילו התראות תקבל ואיך</p></div>);
}

function EmailSection({ settings, toggle }: { settings: NotificationSettings['email']; toggle: (k: string) => void }) {
  return (
    <div className="space-y-3 border-b pb-6">
      <h3 className="font-medium">התראות באימייל</h3>
      <Toggle label="משימה הוקצתה אליי" checked={settings.taskAssigned} onChange={() => toggle('taskAssigned')} />
      <Toggle label="משימה מתקרבת לתאריך יעד" checked={settings.taskDue} onChange={() => toggle('taskDue')} />
      <Toggle label="התקבל תשלום" checked={settings.paymentReceived} onChange={() => toggle('paymentReceived')} />
      <Toggle label="נדרש אישור" checked={settings.approvalNeeded} onChange={() => toggle('approvalNeeded')} />
      <Toggle label="סיכום שבועי" checked={settings.weeklyDigest} onChange={() => toggle('weeklyDigest')} />
    </div>
  );
}

function PushSection({ settings, toggle }: { settings: NotificationSettings['push']; toggle: (k: string) => void }) {
  return (
    <div className="space-y-3 border-b pb-6">
      <h3 className="font-medium">התראות Push</h3>
      <Toggle label="הפעל התראות Push" checked={settings.enabled} onChange={() => toggle('enabled')} />
      <Toggle label="התראות דחופות בלבד" checked={settings.urgentOnly} onChange={() => toggle('urgentOnly')} disabled={!settings.enabled} />
    </div>
  );
}

function InAppSection({ settings, toggle }: { settings: NotificationSettings['inApp']; toggle: (k: string) => void }) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">התראות באפליקציה</h3>
      <Toggle label="הפעל התראות" checked={settings.enabled} onChange={() => toggle('enabled')} />
      <Toggle label="צליל התראה" checked={settings.sound} onChange={() => toggle('sound')} disabled={!settings.enabled} />
    </div>
  );
}

interface ToggleProps { label: string; checked: boolean; onChange: () => void; disabled?: boolean }
function Toggle({ label, checked, onChange, disabled }: ToggleProps) {
  return (
    <label className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-sm">{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled}
        className="h-5 w-5 rounded border-gray-300" />
    </label>
  );
}
