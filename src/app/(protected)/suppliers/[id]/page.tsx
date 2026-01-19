import { getAuth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { SupplierDetails } from './supplier-details';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SupplierDetailsPage({ params }: PageProps) {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <SupplierDetails supplierId={id} />;
}
