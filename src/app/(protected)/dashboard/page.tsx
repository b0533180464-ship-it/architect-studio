import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardContent } from './dashboard-content';

export default async function DashboardPage() {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  return <DashboardContent />;
}
