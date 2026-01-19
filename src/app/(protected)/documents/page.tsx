import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { DocumentsContent } from './documents-content';

export default async function DocumentsPage() {
  const auth = await getAuth();

  if (!auth) {
    redirect('/login');
  }

  return <DocumentsContent />;
}
