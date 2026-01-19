import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { PaymentsContent } from './payments-content';

export default async function PaymentsPage() {
  const auth = await getAuth();

  if (!auth) {
    redirect('/login');
  }

  return <PaymentsContent />;
}
