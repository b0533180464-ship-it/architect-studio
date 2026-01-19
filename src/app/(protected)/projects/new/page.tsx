import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProjectForm } from '../project-form';

export default async function NewProjectPage() {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <h1 className="text-xl font-semibold">פרויקט חדש</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <ProjectForm />
      </main>
    </div>
  );
}
