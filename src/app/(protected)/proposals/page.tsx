import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { ProposalsContent } from './proposals-content';

export default async function ProposalsPage() {
  const auth = await getAuth();

  if (!auth) {
    redirect('/login');
  }

  return <ProposalsContent />;
}
