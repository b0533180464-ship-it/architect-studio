import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ContactsContent } from './contacts-content';

export default async function ContactsPage() {
  const auth = await getAuth();

  if (!auth?.user) {
    redirect('/login');
  }

  return <ContactsContent />;
}
