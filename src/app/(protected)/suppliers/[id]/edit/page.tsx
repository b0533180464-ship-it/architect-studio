import { getAuth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { EditSupplierContent } from './edit-supplier-content';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSupplierPage({ params }: PageProps) {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <EditSupplierContent supplierId={id} />;
}
