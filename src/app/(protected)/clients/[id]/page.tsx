import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ClientDetails } from './client-details';

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuth();
  const { id } = await params;

  if (!auth?.user) {
    redirect('/login');
  }

  return <ClientDetails clientId={id} />;
}
