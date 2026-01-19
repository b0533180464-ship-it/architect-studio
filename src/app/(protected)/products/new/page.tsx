import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NewProductForm } from './new-product-form';

export default async function NewProductPage() {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  return <NewProductForm />;
}
