/* eslint-disable max-lines-per-function, complexity */
'use client';

import { trpc } from '@/lib/trpc';
import { EntitySheet, EntitySheetSection, EntitySheetField } from '@/components/data-table';
import { typeOptions, statusOptions, communicationOptions } from './clients-columns';

interface ClientDetailSheetProps {
  clientId: string | null;
  onClose: () => void;
}

export function ClientDetailSheet({ clientId, onClose }: ClientDetailSheetProps) {
  const { data: client } = trpc.clients.getById.useQuery(
    { id: clientId! },
    { enabled: !!clientId }
  );

  if (!clientId) return null;

  return (
    <EntitySheet
      open={!!clientId}
      onOpenChange={(open) => !open && onClose()}
      title={client?.name || 'פרטי לקוח'}
      detailUrl={`/clients/${clientId}`}
    >
      <div className="space-y-4">
        {client && (
          <>
            <EntitySheetSection title="פרטים כלליים">
              <EntitySheetField label="שם">{client.name}</EntitySheetField>
              <EntitySheetField label="סוג">
                {typeOptions.find((o) => o.value === client.type)?.label}
              </EntitySheetField>
              <EntitySheetField label="סטטוס">
                {statusOptions.find((o) => o.value === client.status)?.label}
              </EntitySheetField>
            </EntitySheetSection>
            <EntitySheetSection title="פרטי קשר">
              <EntitySheetField label="טלפון">{client.phone || '-'}</EntitySheetField>
              <EntitySheetField label="נייד">{client.mobile || '-'}</EntitySheetField>
              <EntitySheetField label="אימייל">{client.email || '-'}</EntitySheetField>
              <EntitySheetField label="תקשורת מועדפת">
                {communicationOptions.find((o) => o.value === client.preferredCommunication)?.label}
              </EntitySheetField>
            </EntitySheetSection>
            {(client.address || client.city) && (
              <EntitySheetSection title="כתובת">
                <EntitySheetField label="כתובת">{client.address || '-'}</EntitySheetField>
                <EntitySheetField label="עיר">{client.city || '-'}</EntitySheetField>
              </EntitySheetSection>
            )}
            {client.notes && (
              <EntitySheetSection title="הערות">
                <p className="text-sm">{client.notes}</p>
              </EntitySheetSection>
            )}
          </>
        )}
      </div>
    </EntitySheet>
  );
}
