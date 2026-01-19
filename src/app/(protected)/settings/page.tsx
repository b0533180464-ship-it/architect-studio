import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SettingsContent } from './settings-content';

export default async function SettingsPage() {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  return <SettingsContent />;
}
