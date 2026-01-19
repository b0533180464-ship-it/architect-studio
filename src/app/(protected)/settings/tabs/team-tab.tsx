'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import type { Tenant, User } from '@prisma/client';

const ROLE_LABELS: Record<string, string> = { owner: 'בעלים', manager: 'מנהל/ת', member: 'חבר/ת צוות' };

interface Props {
  tenant: Tenant | null | undefined;
  user: Partial<User> | null | undefined;
}

export function TeamTab({ user }: Props) {
  const { data: team, isLoading } = trpc.user.list.useQuery();
  const userRole = user?.role || 'member';

  if (isLoading) return <div className="text-muted-foreground">טוען...</div>;

  return (
    <div className="space-y-6">
      <TeamHeader />
      <TeamList team={team || []} currentUserId={user?.id} userRole={userRole} />
      {(userRole === 'owner' || userRole === 'manager') && <InviteSection />}
    </div>
  );
}

function TeamHeader() {
  return (<div><h2 className="text-lg font-semibold">חברי הצוות</h2>
    <p className="text-sm text-muted-foreground">ניהול חברי הצוות במשרד</p></div>);
}

interface TeamMember {
  id: string; firstName: string | null; lastName: string | null; email: string;
  role: string; title: string | null; avatar: string | null;
}

interface TeamListProps { team: TeamMember[]; currentUserId: string | undefined; userRole: string; }

function TeamList({ team, currentUserId, userRole }: TeamListProps) {
  return (
    <div className="space-y-3">
      {team.map((member) => (
        <TeamMemberCard key={member.id} member={member}
          isCurrentUser={member.id === currentUserId} canManage={userRole === 'owner'} />
      ))}
    </div>
  );
}

interface TeamMemberCardProps { member: TeamMember; isCurrentUser: boolean; canManage: boolean; }

function TeamMemberCard({ member, isCurrentUser, canManage }: TeamMemberCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(member.role);
  const utils = trpc.useUtils();
  const mutation = trpc.user.updateRole.useMutation({ onSuccess: () => { utils.user.list.invalidate(); setIsEditing(false); } });
  const handleSave = () => mutation.mutate({ userId: member.id, role: selectedRole as 'owner' | 'manager' | 'member' });

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <MemberInfo member={member} isCurrentUser={isCurrentUser} />
      <MemberActions member={member} isCurrentUser={isCurrentUser} canManage={canManage}
        isEditing={isEditing} setIsEditing={setIsEditing} selectedRole={selectedRole}
        setSelectedRole={setSelectedRole} handleSave={handleSave} isPending={mutation.isPending} />
    </div>
  );
}

function MemberInfo({ member, isCurrentUser }: { member: TeamMember; isCurrentUser: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {member.firstName?.[0]}{member.lastName?.[0]}
      </div>
      <div>
        <p className="font-medium">{member.firstName} {member.lastName} {isCurrentUser && '(אני)'}</p>
        <p className="text-sm text-muted-foreground">{member.email}</p>
      </div>
    </div>
  );
}

interface MemberActionsProps {
  member: TeamMember; isCurrentUser: boolean; canManage: boolean; isEditing: boolean;
  setIsEditing: (v: boolean) => void; selectedRole: string; setSelectedRole: (v: string) => void;
  handleSave: () => void; isPending: boolean;
}

function MemberActions({ member, isCurrentUser, canManage, isEditing, setIsEditing, selectedRole, setSelectedRole, handleSave, isPending }: MemberActionsProps) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
          <option value="manager">מנהל/ת</option><option value="member">חבר/ת צוות</option>
        </select>
        <Button size="sm" onClick={handleSave} disabled={isPending}>שמור</Button>
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>ביטול</Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full bg-muted px-3 py-1 text-sm">{ROLE_LABELS[member.role]}</span>
      {canManage && !isCurrentUser && member.role !== 'owner' && (
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>ערוך</Button>
      )}
    </div>
  );
}

function InviteSection() {
  const { email, setEmail, role, setRole, message, mutation, handleInvite } = useInviteForm();

  return (
    <form onSubmit={handleInvite} className="space-y-4 border-t pt-6">
      <h3 className="font-medium">הזמן חבר צוות חדש</h3>
      <InviteFormFields email={email} setEmail={setEmail} role={role} setRole={setRole} isPending={mutation.isPending} />
      {message && <p className={`text-sm ${message.includes('שגיאה') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
    </form>
  );
}

function useInviteForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'manager' | 'member'>('member');
  const [message, setMessage] = useState('');
  const utils = trpc.useUtils();

  const mutation = trpc.onboarding.inviteTeam.useMutation({
    onSuccess: () => { setMessage('ההזמנה נשלחה בהצלחה'); setEmail(''); utils.user.list.invalidate(); },
    onError: (err) => setMessage(`שגיאה: ${err.message}`),
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setMessage('נא להזין אימייל תקין'); return; }
    mutation.mutate({ invites: [{ email, role }] });
  };

  return { email, setEmail, role, setRole, message, mutation, handleInvite };
}

interface InviteFormFieldsProps {
  email: string; setEmail: (v: string) => void; role: 'manager' | 'member';
  setRole: (v: 'manager' | 'member') => void; isPending: boolean;
}

function InviteFormFields({ email, setEmail, role, setRole, isPending }: InviteFormFieldsProps) {
  return (
    <div className="flex gap-3">
      <div className="flex-1 space-y-2">
        <Label>אימייל</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" dir="ltr" />
      </div>
      <div className="w-32 space-y-2">
        <Label>תפקיד</Label>
        <select value={role} onChange={(e) => setRole(e.target.value as 'manager' | 'member')} className="w-full h-10 rounded-md border bg-background px-3">
          <option value="member">חבר צוות</option><option value="manager">מנהל/ת</option>
        </select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={isPending}>{isPending ? 'שולח...' : 'שלח הזמנה'}</Button>
      </div>
    </div>
  );
}
