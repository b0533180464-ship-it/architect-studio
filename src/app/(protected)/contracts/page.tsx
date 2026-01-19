import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { ContractsContent } from './contracts-content';

export default async function ContractsPage() {
  const auth = await getAuth();

  if (!auth) {
    redirect('/login');
  }

  return <ContractsContent />;
}
