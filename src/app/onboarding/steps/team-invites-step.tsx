'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';

interface StepProps { onNext: () => void; onPrevious: () => void; }
interface Invite { email: string; role: 'manager' | 'member'; }

export function TeamInvitesStep({ onNext, onPrevious }: StepProps) {
  const [invites, setInvites] = useState<Invite[]>([{ email: '', role: 'member' }]);
  const [error, setError] = useState('');

  const mutation = trpc.onboarding.inviteTeam.useMutation({
    onSuccess: () => onNext(), onError: (err) => setError(err.message),
  });
  const skipMutation = trpc.onboarding.skipStep.useMutation({ onSuccess: () => onNext() });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = invites.filter((i) => i.email.includes('@'));
    if (valid.length === 0) { onNext(); return; }
    mutation.mutate({ invites: valid });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header />
      <InviteList invites={invites} setInvites={setInvites} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Buttons onPrev={onPrevious} onSkip={() => skipMutation.mutate({ step: 5 })} isPending={mutation.isPending} />
    </form>
  );
}

function Header() {
  return (<div className="text-center"><h2 className="text-2xl font-bold">הזמן את הצוות</h2>
    <p className="mt-2 text-muted-foreground">הזמן חברי צוות להצטרף למשרד שלך</p></div>);
}

interface InviteListProps { invites: Invite[]; setInvites: (i: Invite[]) => void; }

function InviteList({ invites, setInvites }: InviteListProps) {
  const update = (i: number, field: keyof Invite, v: string) => {
    const n = invites.map((inv, idx) => idx === i ? { ...inv, [field]: v } as Invite : inv);
    setInvites(n);
  };
  return (
    <div className="space-y-4">
      {invites.map((invite, i) => (
        <InviteRow key={i} invite={invite} onUpdate={(f, v) => update(i, f, v)}
          canRemove={invites.length > 1} onRemove={() => setInvites(invites.filter((_, idx) => idx !== i))} />
      ))}
      <Button type="button" variant="outline" onClick={() => setInvites([...invites, { email: '', role: 'member' }])} className="w-full">
        + הוסף חבר צוות
      </Button>
      <p className="text-sm text-muted-foreground text-center">ההזמנות יישלחו באימייל</p>
    </div>
  );
}

interface InviteRowProps {
  invite: Invite; onUpdate: (f: keyof Invite, v: string) => void; canRemove: boolean; onRemove: () => void;
}

function InviteRow({ invite, onUpdate, canRemove, onRemove }: InviteRowProps) {
  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1 space-y-2">
        <Label>אימייל</Label>
        <Input type="email" value={invite.email} dir="ltr" onChange={(e) => onUpdate('email', e.target.value)} placeholder="user@example.com" />
      </div>
      <div className="w-32 space-y-2">
        <Label>תפקיד</Label>
        <select value={invite.role} onChange={(e) => onUpdate('role', e.target.value)} className="w-full h-10 rounded-md border bg-background px-3">
          <option value="member">חבר צוות</option><option value="manager">מנהל/ת</option>
        </select>
      </div>
      {canRemove && <Button type="button" variant="ghost" size="icon" onClick={onRemove}>✕</Button>}
    </div>
  );
}

interface ButtonsProps { onPrev: () => void; onSkip: () => void; isPending: boolean; }

function Buttons({ onPrev, onSkip, isPending }: ButtonsProps) {
  return (
    <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onPrev} className="flex-1">חזור</Button>
      <Button type="button" variant="ghost" onClick={onSkip} className="flex-1">דלג</Button>
      <Button type="submit" className="flex-1" disabled={isPending}>{isPending ? 'שולח...' : 'המשך'}</Button>
    </div>
  );
}
