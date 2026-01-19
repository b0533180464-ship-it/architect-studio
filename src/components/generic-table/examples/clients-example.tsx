/**
 * Example: Using GenericDataTable for Clients
 *
 * This file demonstrates how to integrate the GenericDataTable component
 * with custom fields and views for the clients entity.
 *
 * To use this in production, replace the existing ClientsTable component
 * with the GenericClientsTable component.
 */
'use client';

import { GenericDataTable, type BaseColumnDef } from '@/components/generic-table';

// Define the Client type (from your existing types)
interface Client {
  id: string;
  name: string;
  type: 'individual' | 'company';
  status: 'lead' | 'active' | 'past' | 'inactive';
  phone: string | null;
  email: string | null;
  city: string | null;
  preferredCommunication: 'whatsapp' | 'email' | 'phone' | 'in_person';
}

// Define the base columns (built-in fields)
const clientBaseColumns: BaseColumnDef<Client>[] = [
  {
    key: 'name',
    label: 'שם',
    width: 200,
    fieldType: 'text',
    sortable: true,
    hideable: false, // Name should always be visible
  },
  {
    key: 'type',
    label: 'סוג',
    width: 100,
    fieldType: 'select',
    sortable: true,
    options: [
      { value: 'individual', label: 'פרטי' },
      { value: 'company', label: 'חברה' },
    ],
  },
  {
    key: 'status',
    label: 'סטטוס',
    width: 100,
    fieldType: 'select',
    sortable: true,
    options: [
      { value: 'lead', label: 'ליד', color: '#8b5cf6' },
      { value: 'active', label: 'פעיל', color: '#22c55e' },
      { value: 'past', label: 'לשעבר', color: '#94a3b8' },
      { value: 'inactive', label: 'לא פעיל', color: '#ef4444' },
    ],
  },
  {
    key: 'phone',
    label: 'טלפון',
    width: 120,
    fieldType: 'phone',
  },
  {
    key: 'email',
    label: 'אימייל',
    width: 180,
    fieldType: 'email',
  },
  {
    key: 'city',
    label: 'עיר',
    width: 100,
    fieldType: 'text',
  },
  {
    key: 'preferredCommunication',
    label: 'תקשורת מועדפת',
    width: 120,
    fieldType: 'select',
    options: [
      { value: 'whatsapp', label: 'וואטסאפ' },
      { value: 'email', label: 'אימייל' },
      { value: 'phone', label: 'טלפון' },
      { value: 'in_person', label: 'פגישה' },
    ],
  },
];

interface GenericClientsTableProps {
  clients: Client[];
  isLoading?: boolean;
  onRowClick?: (client: Client) => void;
}

/**
 * Generic Clients Table with Custom Fields and Views support
 */
export function GenericClientsTable({
  clients,
  isLoading,
  onRowClick,
}: GenericClientsTableProps) {
  // Fetch custom field values for all clients
  // In production, you'd batch this or include it in the main query
  const customFieldValues = new Map<string, Record<string, unknown>>();

  // For each client, you would fetch their custom field values:
  // This is a simplified example - in production you'd batch fetch
  // const { data: valuesData } = trpc.customFields.getValuesMap.useQuery(...)

  return (
    <GenericDataTable<Client>
      entityType="clients"
      data={clients}
      isLoading={isLoading}
      baseColumns={clientBaseColumns}
      onRowClick={onRowClick}
      customFieldValues={customFieldValues}
      emptyMessage="אין לקוחות להצגה"
      onAddCustomField={(fieldType, name, fieldKey) => {
        console.log('Custom field added:', { fieldType, name, fieldKey });
        // The GenericDataTable handles this internally via the hook
      }}
      onUpdateCustomField={(fieldId, name) => {
        console.log('Custom field updated:', { fieldId, name });
      }}
      onDeleteCustomField={(fieldId) => {
        console.log('Custom field deleted:', fieldId);
      }}
    />
  );
}

/**
 * Example usage in a page:
 *
 * ```tsx
 * import { GenericClientsTable } from '@/components/generic-table/examples/clients-example';
 *
 * export function ClientsPage() {
 *   const { data, isLoading } = trpc.clients.list.useQuery({ page: 1, pageSize: 50 });
 *
 *   return (
 *     <GenericClientsTable
 *       clients={data?.items || []}
 *       isLoading={isLoading}
 *       onRowClick={(client) => router.push(`/clients/${client.id}`)}
 *     />
 *   );
 * }
 * ```
 */
