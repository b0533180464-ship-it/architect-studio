import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ClientsContent } from './clients-content';

export default async function ClientsPage() {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  return <ClientsContent />;
}
