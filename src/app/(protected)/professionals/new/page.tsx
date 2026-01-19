import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfessionalForm } from '@/components/professionals/professional-form';

export default async function NewProfessionalPage() {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/professionals" className="text-muted-foreground hover:text-foreground">
            &larr; חזרה לבעלי מקצוע
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>בעל מקצוע חדש</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfessionalForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
