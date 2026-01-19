import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/layout';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  return <AppLayout>{children}</AppLayout>;
}
