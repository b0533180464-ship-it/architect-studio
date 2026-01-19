import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EditProductContent } from './edit-product-content';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const auth = await getAuth();
  const { id } = await params;

  if (!auth?.user) {
    redirect('/login');
  }

  return <EditProductContent productId={id} />;
}
