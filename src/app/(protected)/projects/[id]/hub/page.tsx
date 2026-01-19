import { getAuth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { ProjectHubContent } from './hub-content';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectHubPage({ params }: PageProps) {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <ProjectHubContent projectId={id} />;
}
