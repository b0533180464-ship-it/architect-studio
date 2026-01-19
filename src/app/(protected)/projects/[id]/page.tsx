import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProjectDetails } from './project-details';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuth();
  const { id } = await params;

  if (!auth?.user) {
    redirect('/login');
  }

  return <ProjectDetails projectId={id} />;
}
