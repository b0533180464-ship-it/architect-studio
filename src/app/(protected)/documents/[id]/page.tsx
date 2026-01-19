import { redirect, notFound } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { DocumentDetails } from './document-details';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: Props) {
  const auth = await getAuth();

  if (!auth) {
    redirect('/login');
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <DocumentDetails documentId={id} />;
}
