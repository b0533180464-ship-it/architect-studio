/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { ClientForm } from '../../client-form';

export function EditClientContent({ clientId }: { clientId: string }) {
  const { data: client, isLoading, error } = trpc.clients.getById.useQuery({ id: clientId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">טוען...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">לקוח לא נמצא</p>
          <Link href="/clients">
            <Button variant="outline">חזרה לרשימה</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">עריכת לקוח: {client.name}</h1>
      </div>
      <ClientForm client={client} />
    </>
  );
}
