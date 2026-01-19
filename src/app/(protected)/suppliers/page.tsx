import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SuppliersContent } from './suppliers-content';

export default async function SuppliersPage() {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  return <SuppliersContent />;
}
