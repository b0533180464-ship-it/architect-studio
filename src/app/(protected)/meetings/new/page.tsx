import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { NewMeetingForm } from './new-meeting-form';

export default async function NewMeetingPage() {
  const auth = await getAuth();

  if (!auth) {
    redirect('/login');
  }

  return <NewMeetingForm />;
}
