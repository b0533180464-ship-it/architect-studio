import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EditClientContent } from './edit-client-content';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuth();
  const { id } = await params;

  if (!auth?.user) {
    redirect('/login');
  }

  return <EditClientContent clientId={id} />;
}
