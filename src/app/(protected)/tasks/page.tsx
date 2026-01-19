import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { TasksContent } from './tasks-content';

export default async function TasksPage() {
  const auth = await getAuth();

  if (!auth) {
    redirect('/login');
  }

  return <TasksContent />;
}
