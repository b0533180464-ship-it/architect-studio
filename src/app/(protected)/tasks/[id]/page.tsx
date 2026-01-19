import { redirect, notFound } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { TaskDetails } from './task-details';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TaskPage({ params }: Props) {
  const auth = await getAuth();

  if (!auth) {
    redirect('/login');
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <TaskDetails taskId={id} />;
}
