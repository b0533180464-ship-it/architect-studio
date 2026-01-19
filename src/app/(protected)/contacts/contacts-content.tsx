/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContactsTabs } from './contacts-tabs';
import { ContactsSearch } from './contacts-search';
import { ContactCard } from './contact-card';

type ContactType = 'clients' | 'suppliers' | 'professionals';

export function ContactsContent() {
  const [activeTab, setActiveTab] = useState<ContactType>('clients');
  const [search, setSearch] = useState('');

  // Fetch all three types for counts
  const { data: clientsData } = trpc.clients.list.useQuery({ page: 1, pageSize: 50, search: search || undefined });
  const { data: suppliersData } = trpc.suppliers.list.useQuery({ page: 1, pageSize: 50, search: search || undefined });
  const { data: professionalsData } = trpc.professionals.list.useQuery({
    page: 1,
    pageSize: 50,
    search: search || undefined,
  });

  const counts = {
    clients: clientsData?.pagination.total || 0,
    suppliers: suppliersData?.pagination.total || 0,
    professionals: professionalsData?.pagination.total || 0,
  };

  const getNewLink = () => {
    switch (activeTab) {
      case 'clients':
        return '/clients/new';
      case 'suppliers':
        return '/suppliers/new';
      case 'professionals':
        return '/professionals/new';
    }
  };

  const getNewLabel = () => {
    switch (activeTab) {
      case 'clients':
        return '+ לקוח חדש';
      case 'suppliers':
        return '+ ספק חדש';
      case 'professionals':
        return '+ בעל מקצוע חדש';
    }
  };

  const isLoading =
    (activeTab === 'clients' && !clientsData) ||
    (activeTab === 'suppliers' && !suppliersData) ||
    (activeTab === 'professionals' && !professionalsData);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">אנשי קשר</h1>
        <Link href={getNewLink()}>
          <Button>{getNewLabel()}</Button>
        </Link>
      </div>

      <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <ContactsSearch value={search} onChange={setSearch} />
            </div>

            <ContactsTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-pulse text-muted-foreground">טוען...</div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {activeTab === 'clients' && renderClients(clientsData?.items || [])}
                  {activeTab === 'suppliers' && renderSuppliers(suppliersData?.items || [])}
                  {activeTab === 'professionals' && renderProfessionals(professionalsData?.items || [])}
                </div>
              )}

              {!isLoading && getItemCount() === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground mb-4">לא נמצאו תוצאות</p>
                  <Link href={getNewLink()}>
                    <Button variant="outline">{getNewLabel()}</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
    </>
  );

  function getItemCount() {
    switch (activeTab) {
      case 'clients':
        return clientsData?.items.length || 0;
      case 'suppliers':
        return suppliersData?.items.length || 0;
      case 'professionals':
        return professionalsData?.items.length || 0;
    }
  }
}

function renderClients(clients: { id: string; name: string; contactPerson?: string | null; phone?: string | null; email?: string | null; status?: string | null }[]) {
  return clients.map((c) => (
    <ContactCard
      key={c.id}
      id={c.id}
      type="client"
      name={c.name}
      subtitle={c.contactPerson}
      phone={c.phone}
      email={c.email}
      badge={c.status ? { label: c.status } : null}
    />
  ));
}

function renderSuppliers(suppliers: { id: string; name: string; contactPerson?: string | null; phone?: string | null; email?: string | null; category?: { name: string; color?: string | null } | null; rating?: number | null }[]) {
  return suppliers.map((s) => (
    <ContactCard
      key={s.id}
      id={s.id}
      type="supplier"
      name={s.name}
      subtitle={s.contactPerson}
      phone={s.phone}
      email={s.email}
      badge={s.category ? { label: s.category.name, color: s.category.color } : null}
      rating={s.rating}
    />
  ));
}

function renderProfessionals(professionals: { id: string; name: string; companyName?: string | null; phone: string; email?: string | null; trade?: { name: string; color?: string | null } | null; rating?: number | null }[]) {
  return professionals.map((p) => (
    <ContactCard
      key={p.id}
      id={p.id}
      type="professional"
      name={p.name}
      subtitle={p.companyName}
      phone={p.phone}
      email={p.email}
      badge={p.trade ? { label: p.trade.name, color: p.trade.color } : null}
      rating={p.rating}
    />
  ));
}
