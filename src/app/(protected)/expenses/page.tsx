import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { ExpensesContent } from './expenses-content';

export default async function ExpensesPage() {
  const auth = await getAuth();

  if (!auth) {
    redirect('/login');
  }

  return <ExpensesContent />;
}
