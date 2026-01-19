'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { TableSkeleton, TableEmptyState, EntitySheet } from '@/components/data-table';
import { clientsColumns, typeOptions, statusOptions, communicationOptions, type ClientTableItem } from './clients-columns';
import { ClientTableRow } from './client-table-row';

interface ClientsTableProps {
  clients: ClientTableItem[];
  isLoading?: boolean;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onDelete?: (id: string) => void;
}

/**
 * טבלת לקוחות עם עריכה inline
 */
export function ClientsTable({ clients, isLoading, onUpdate, onDelete }: ClientsTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) return <TableSkeleton columns={clientsColumns.length} />;
  if (clients.length === 0) return <TableEmptyState message="אין לקוחות להצגה" />;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse" dir="rtl">
          <ClientTableHeader />
          <tbody>
            {clients.map((client) => (
              <ClientTableRow
                key={client.id}
                client={client}
                onUpdate={(field, value) => onUpdate(client.id, field, value)}
                onClick={() => setSelectedId(client.id)}
                onDelete={onDelete ? () => onDelete(client.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      </div>
      <ClientDetailSheet clientId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

function ClientTableHeader() {
  return (
    <thead className="sticky top-0 z-10">
      <tr>
        {clientsColumns.map((col) => (
          <th key={col.key} style={{ width: col.width, minWidth: col.minWidth }} className="py-3 px-2 text-right text-sm font-medium text-muted-foreground border-l border-border/50 bg-muted/30">
            {col.label}{col.required && <span className="text-destructive">*</span>}
          </th>
        ))}
        <th className="py-3 px-2 w-10 bg-muted/30 border-l border-border/50" />
      </tr>
    </thead>
  );
}

function ClientDetailSheet({ clientId, onClose }: { clientId: string | null; onClose: () => void }) {
  const { data: client } = trpc.clients.getById.useQuery({ id: clientId! }, { enabled: !!clientId });

  if (!clientId) return null;

  return (
    <EntitySheet open={!!clientId} onOpenChange={(open) => !open && onClose()} title={client?.name || 'פרטי לקוח'} detailUrl={`/clients/${clientId}`}>
      <div className="space-y-4">
        {client && (
          <>
            <div><span className="text-muted-foreground">שם:</span> {client.name}</div>
            <div><span className="text-muted-foreground">סוג:</span> {typeOptions.find((o) => o.value === client.type)?.label}</div>
            <div><span className="text-muted-foreground">סטטוס:</span> {statusOptions.find((o) => o.value === client.status)?.label}</div>
            <div><span className="text-muted-foreground">טלפון:</span> {client.phone || '-'}</div>
            <div><span className="text-muted-foreground">אימייל:</span> {client.email || '-'}</div>
            <div><span className="text-muted-foreground">תקשורת:</span> {communicationOptions.find((o) => o.value === client.preferredCommunication)?.label}</div>
            {client.notes && <div><span className="text-muted-foreground">הערות:</span> {client.notes}</div>}
          </>
        )}
      </div>
    </EntitySheet>
  );
}

export { clientsColumns, typeOptions, statusOptions, communicationOptions };
