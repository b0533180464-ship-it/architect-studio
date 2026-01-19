import { redirect, notFound } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { MeetingDetails } from './meeting-details';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MeetingPage({ params }: Props) {
  const auth = await getAuth();

  if (!auth) {
    redirect('/login');
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <MeetingDetails meetingId={id} />;
}
