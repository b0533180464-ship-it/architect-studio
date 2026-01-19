import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { GenericEntityContent } from './generic-entity-content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GenericEntityPage({ params }: PageProps) {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  const { slug } = await params;

  return <GenericEntityContent slug={slug} />;
}
