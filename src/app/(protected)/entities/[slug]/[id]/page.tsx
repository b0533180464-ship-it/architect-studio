import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EntityDetailContent } from './entity-detail-content';

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function EntityDetailPage({ params }: PageProps) {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  const { slug, id } = await params;

  return <EntityDetailContent slug={slug} entityId={id} />;
}
