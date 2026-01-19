'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { ProfileForm } from './profile/profile-form';
import type { Tenant, User } from '@prisma/client';

interface Props {
  tenant: Tenant | null | undefined;
  user: Partial<User> | null | undefined;
}

export function ProfileTab({ user }: Props) {
  const { formData, setFormData, message, mutation, handleSubmit } = useProfileForm(user);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProfileHeader />
      <ProfileForm formData={formData} setFormData={setFormData} email={user?.email || ''} />
      {message && <Message message={message} />}
      <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'שומר...' : 'שמור שינויים'}</Button>
    </form>
  );
}

function useProfileForm(user: Props['user']) {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', title: '', avatar: '', language: 'he', theme: 'system',
  });
  const [message, setMessage] = useState('');
  const utils = trpc.useUtils();

  useEffect(() => {
    if (user) setFormData({
      firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '',
      title: user.title || '', avatar: user.avatar || '', language: user.language || 'he', theme: user.theme || 'system',
    });
  }, [user]);

  const mutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => { setMessage('הפרופיל עודכן בהצלחה'); utils.user.me.invalidate(); setTimeout(() => setMessage(''), 3000); },
    onError: (err) => setMessage(`שגיאה: ${err.message}`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ ...formData, theme: formData.theme as 'light' | 'dark' | 'system' });
  };

  return { formData, setFormData, message, mutation, handleSubmit };
}

function ProfileHeader() {
  return (
    <div>
      <h2 className="text-lg font-semibold">פרופיל</h2>
      <p className="text-sm text-muted-foreground">עדכן את הפרטים האישיים והעדפות התצוגה שלך</p>
    </div>
  );
}

function Message({ message }: { message: string }) {
  const isError = message.includes('שגיאה');
  return <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>{message}</p>;
}
