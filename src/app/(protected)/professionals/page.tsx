import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProfessionalsContent } from './professionals-content';

export default async function ProfessionalsPage() {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  return <ProfessionalsContent />;
}
