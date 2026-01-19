import { getAuth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { EditProfessionalContent } from './edit-professional-content';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProfessionalPage({ params }: PageProps) {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <EditProfessionalContent professionalId={id} />;
}
