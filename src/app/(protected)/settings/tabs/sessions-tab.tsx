'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import type { Tenant, User } from '@prisma/client';

interface Props {
  tenant: Tenant | null | undefined;
  user: Partial<User> | null | undefined;
}

export function SessionsTab({}: Props) {
  const { data: sessions, isLoading } = trpc.session.list.useQuery();
  const utils = trpc.useUtils();

  const revokeMutation = trpc.session.revoke.useMutation({
    onSuccess: () => { utils.session.list.invalidate(); },
  });

  const revokeAllMutation = trpc.session.revokeAll.useMutation({
    onSuccess: () => { utils.session.list.invalidate(); },
  });

  if (isLoading) return <div className="text-muted-foreground">טוען...</div>;

  return (
    <div className="space-y-6">
      <Header />
      <SessionList
        sessions={sessions || []}
        onRevoke={(id) => revokeMutation.mutate({ sessionId: id })}
        isPending={revokeMutation.isPending}
      />
      <RevokeAllButton onClick={() => revokeAllMutation.mutate()} isPending={revokeAllMutation.isPending} />
    </div>
  );
}

function Header() {
  return (
    <div>
      <h2 className="text-lg font-semibold">מכשירים מחוברים</h2>
      <p className="text-sm text-muted-foreground">נהל את ההתחברויות הפעילות שלך</p>
    </div>
  );
}

interface Session {
  id: string;
  deviceType: string | null;
  deviceName: string | null;
  browser: string | null;
  os: string | null;
  ip: string | null;
  lastActiveAt: Date;
  createdAt: Date;
}

interface SessionListProps {
  sessions: Session[];
  onRevoke: (id: string) => void;
  isPending: boolean;
}

function SessionList({ sessions, onRevoke, isPending }: SessionListProps) {
  if (sessions.length === 0) {
    return <p className="text-muted-foreground">אין מכשירים מחוברים</p>;
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} onRevoke={onRevoke} isPending={isPending} />
      ))}
    </div>
  );
}

interface SessionCardProps {
  session: Session;
  onRevoke: (id: string) => void;
  isPending: boolean;
}

function SessionCard({ session, onRevoke, isPending }: SessionCardProps) {
  const deviceIcon = getDeviceIcon(session.deviceType);
  const lastActive = formatDate(session.lastActiveAt);

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <span className="text-2xl">{deviceIcon}</span>
        <div>
          <p className="font-medium">
            {session.browser || 'דפדפן לא ידוע'} {session.os ? `על ${session.os}` : ''}
          </p>
          <p className="text-sm text-muted-foreground">
            {session.ip || 'IP לא ידוע'} · פעילות אחרונה: {lastActive}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={() => onRevoke(session.id)} disabled={isPending}>
        נתק
      </Button>
    </div>
  );
}

interface RevokeAllButtonProps {
  onClick: () => void;
  isPending: boolean;
}

function RevokeAllButton({ onClick, isPending }: RevokeAllButtonProps) {
  return (
    <div className="border-t pt-6">
      <Button variant="destructive" onClick={onClick} disabled={isPending}>
        {isPending ? 'מנתק...' : 'נתק את כל המכשירים'}
      </Button>
      <p className="mt-2 text-sm text-muted-foreground">
        פעולה זו תנתק אותך מכל המכשירים למעט המכשיר הנוכחי
      </p>
    </div>
  );
}

function getDeviceIcon(deviceType: string | null): string {
  switch (deviceType) {
    case 'mobile': return '📱';
    case 'tablet': return '📱';
    case 'desktop': return '💻';
    default: return '🖥️';
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('he-IL', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}
