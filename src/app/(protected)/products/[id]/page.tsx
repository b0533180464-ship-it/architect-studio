import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProductDetails } from './product-details';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const auth = await getAuth();
  const { id } = await params;

  if (!auth?.user) {
    redirect('/login');
  }

  return <ProductDetails productId={id} />;
}
