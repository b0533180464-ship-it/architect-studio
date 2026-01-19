import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { CalendarContent } from './calendar-content';

export default async function CalendarPage() {
  const auth = await getAuth();
  if (!auth) redirect('/login');

  return <CalendarContent />;
}
