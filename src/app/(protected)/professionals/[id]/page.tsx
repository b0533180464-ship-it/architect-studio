import { getAuth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { ProfessionalDetails } from './professional-details';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfessionalDetailsPage({ params }: PageProps) {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <ProfessionalDetails professionalId={id} />;
}
