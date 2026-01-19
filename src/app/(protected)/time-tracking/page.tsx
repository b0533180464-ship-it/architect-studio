import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { TimeTrackingContent } from './time-tracking-content';

export default async function TimeTrackingPage() {
  const auth = await getAuth();

  if (!auth) {
    redirect('/login');
  }

  return <TimeTrackingContent />;
}
