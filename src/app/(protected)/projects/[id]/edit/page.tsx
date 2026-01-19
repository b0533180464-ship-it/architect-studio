import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EditProjectContent } from './edit-project-content';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuth();
  const { id } = await params;

  if (!auth?.user) {
    redirect('/login');
  }

  return <EditProjectContent projectId={id} />;
}
