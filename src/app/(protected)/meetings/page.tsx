import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { MeetingsContent } from './meetings-content';

export default async function MeetingsPage() {
  const auth = await getAuth();

  if (!auth) {
    redirect('/login');
  }

  return <MeetingsContent />;
}
