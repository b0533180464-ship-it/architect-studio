import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { NewTaskForm } from './new-task-form';

export default async function NewTaskPage() {
  const auth = await getAuth();

  if (!auth) {
    redirect('/login');
  }

  return <NewTaskForm />;
}
