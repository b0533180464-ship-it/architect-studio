import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProjectProductsContent } from './project-products-content';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectProductsPage({ params }: Props) {
  const auth = await getAuth();
  const { id } = await params;

  if (!auth?.user) {
    redirect('/login');
  }

  return <ProjectProductsContent projectId={id} />;
}
