'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

interface StepProps { onNext: () => void; onPrevious: () => void; }
interface Integrations { googleCalendar: boolean; googleDrive: boolean; quickbooks: boolean; whatsapp: boolean; }

export function IntegrationsStep({ onNext, onPrevious }: StepProps) {
  const [integrations, setIntegrations] = useState<Integrations>({
    googleCalendar: false, googleDrive: false, quickbooks: false, whatsapp: false,
  });
  const [error, setError] = useState('');

  const mutation = trpc.onboarding.setupIntegrations.useMutation({
    onSuccess: () => onNext(), onError: (err) => setError(err.message),
  });
  const skipMutation = trpc.onboarding.skipStep.useMutation({ onSuccess: () => onNext() });
  const toggle = (key: keyof Integrations) => setIntegrations({ ...integrations, [key]: !integrations[key] });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(integrations); }} className="space-y-6">
      <Header />
      <IntegrationList integrations={integrations} toggle={toggle} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Buttons onPrev={onPrevious} onSkip={() => skipMutation.mutate({ step: 7 })} isPending={mutation.isPending} />
    </form>
  );
}

function Header() {
  return (<div className="text-center"><h2 className="text-2xl font-bold">אינטגרציות</h2>
    <p className="mt-2 text-muted-foreground">חבר את המערכות שאתה משתמש בהן</p></div>);
}

interface IntegrationListProps { integrations: Integrations; toggle: (key: keyof Integrations) => void; }

function IntegrationList({ integrations, toggle }: IntegrationListProps) {
  const items: { key: keyof Integrations; title: string; desc: string }[] = [
    { key: 'googleCalendar', title: 'Google Calendar', desc: 'סנכרון פגישות ואירועים' },
    { key: 'googleDrive', title: 'Google Drive', desc: 'שמירת קבצים ותיעוד' },
    { key: 'quickbooks', title: 'QuickBooks', desc: 'סנכרון חשבוניות ותשלומים' },
    { key: 'whatsapp', title: 'WhatsApp Business', desc: 'תקשורת עם לקוחות' },
  ];
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <IntegrationCard key={item.key} checked={integrations[item.key]} onToggle={() => toggle(item.key)}
          title={item.title} description={item.desc} />
      ))}
      <p className="text-sm text-muted-foreground text-center">תוכל להגדיר את החיבורים בהמשך</p>
    </div>
  );
}

interface IntegrationCardProps { checked: boolean; onToggle: () => void; title: string; description: string; }

function IntegrationCard({ checked, onToggle, title, description }: IntegrationCardProps) {
  return (
    <label className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer ${checked ? 'border-primary bg-primary/5' : ''}`}>
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <div className="flex-1"><p className="font-medium">{title}</p><p className="text-sm text-muted-foreground">{description}</p></div>
      <span className="text-xs text-muted-foreground">בקרוב</span>
    </label>
  );
}

interface ButtonsProps { onPrev: () => void; onSkip: () => void; isPending: boolean; }

function Buttons({ onPrev, onSkip, isPending }: ButtonsProps) {
  return (
    <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onPrev} className="flex-1">חזור</Button>
      <Button type="button" variant="ghost" onClick={onSkip} className="flex-1">דלג</Button>
      <Button type="submit" className="flex-1" disabled={isPending}>{isPending ? 'שומר...' : 'סיום'}</Button>
    </div>
  );
}
