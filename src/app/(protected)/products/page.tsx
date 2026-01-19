import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProductsContent } from './products-content';

export default async function ProductsPage() {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  return <ProductsContent />;
}
