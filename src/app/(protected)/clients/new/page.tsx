import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ClientForm } from '../client-form';

export default async function NewClientPage() {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <h1 className="text-xl font-semibold">לקוח חדש</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <ClientForm />
      </main>
    </div>
  );
}
