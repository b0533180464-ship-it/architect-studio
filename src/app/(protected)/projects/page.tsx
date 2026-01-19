import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProjectsContent } from './projects-content';

export default async function ProjectsPage() {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  return <ProjectsContent />;
}
