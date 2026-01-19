'use client';

import { useState } from 'react';
import { GenericDataTable, type BaseColumnDef } from '@/components/generic-table';
import { ClientDetailSheet } from './client-detail-sheet';
import type { ClientTableItem } from './clients-columns';
import { typeOptions, statusOptions, communicationOptions } from './clients-columns';

// Base columns for clients (built-in fields)
const clientBaseColumns: BaseColumnDef<ClientTableItem>[] = [
  {
    key: 'name',
    label: 'שם לקוח',
    width: 180,
    fieldType: 'text',
    sortable: true,
    hideable: false,
    sticky: true,
  },
  {
    key: 'type',
    label: 'סוג',
    width: 100,
    fieldType: 'select',
    sortable: true,
    options: typeOptions,
  },
  {
    key: 'status',
    label: 'סטטוס',
    width: 100,
    fieldType: 'select',
    sortable: true,
    options: statusOptions,
  },
  {
    key: 'email',
    label: 'אימייל',
    width: 180,
    fieldType: 'email',
  },
  {
    key: 'phone',
    label: 'טלפון',
    width: 120,
    fieldType: 'phone',
  },
  {
    key: 'mobile',
    label: 'נייד',
    width: 120,
    fieldType: 'phone',
  },
  {
    key: 'preferredCommunication',
    label: 'דרך תקשורת',
    width: 120,
    fieldType: 'select',
    options: communicationOptions,
  },
  {
    key: 'city',
    label: 'עיר',
    width: 100,
    fieldType: 'text',
  },
];

interface GenericClientsTableProps {
  clients: ClientTableItem[];
  customFieldValues?: Map<string, Record<string, unknown>>;
  isLoading?: boolean;
  onUpdate?: (id: string, field: string, value: unknown) => void;
  onUpdateCustomField?: (id: string, fieldKey: string, value: unknown) => void;
  onDelete?: (id: string) => void;
}

export function GenericClientsTable({
  clients, customFieldValues, isLoading, onUpdate, onUpdateCustomField, onDelete,
}: GenericClientsTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <GenericDataTable<ClientTableItem>
        entityType="clients"
        data={clients}
        customFieldValues={customFieldValues}
        isLoading={isLoading}
        baseColumns={clientBaseColumns}
        onRowClick={(c) => setSelectedId(c.id)}
        onCellUpdate={(id, key, val, isCustom) => {
          isCustom ? onUpdateCustomField?.(id, key, val) : onUpdate?.(id, key, val);
        }}
        detailUrlPattern="/clients/{id}"
        onDelete={onDelete}
        emptyMessage="אין לקוחות להצגה"
      />
      <ClientDetailSheet clientId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

