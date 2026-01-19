import type { ColumnDef } from '@/components/data-table/types';

// אופציות סוג לקוח
export const typeOptions = [
  { value: 'individual', label: 'פרטי' },
  { value: 'company', label: 'חברה' },
];

// אופציות סטטוס
export const statusOptions = [
  { value: 'lead', label: 'ליד', color: '#94a3b8' },
  { value: 'active', label: 'פעיל', color: '#22c55e' },
  { value: 'past', label: 'לקוח עבר', color: '#64748b' },
  { value: 'inactive', label: 'לא פעיל', color: '#ef4444' },
];

// אופציות דרך תקשורת
export const communicationOptions = [
  { value: 'email', label: 'אימייל' },
  { value: 'phone', label: 'טלפון' },
  { value: 'whatsapp', label: 'וואטסאפ' },
];

// טיפוס לקוח לטבלה
export interface ClientTableItem {
  id: string;
  name: string;
  type: string;
  status: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  preferredCommunication: string;
  address: string | null;
  city: string | null;
  companyNumber: string | null;
  contactPerson: string | null;
  notes: string | null;
  projectsCount: number;
}

// הגדרות עמודות ללקוחות - 12 עמודות
export const clientsColumns: ColumnDef<ClientTableItem>[] = [
  { key: 'name', label: 'שם לקוח', type: 'text', width: 'auto', minWidth: 180, required: true, sticky: true },
  { key: 'type', label: 'סוג', type: 'select', width: 100, options: typeOptions },
  { key: 'status', label: 'סטטוס', type: 'select', width: 100, options: statusOptions },
  { key: 'email', label: 'אימייל', type: 'text', width: 180 },
  { key: 'phone', label: 'טלפון', type: 'text', width: 120 },
  { key: 'mobile', label: 'נייד', type: 'text', width: 120 },
  { key: 'preferredCommunication', label: 'דרך תקשורת', type: 'select', width: 120, options: communicationOptions },
  { key: 'address', label: 'כתובת', type: 'text', width: 150 },
  { key: 'city', label: 'עיר', type: 'text', width: 100 },
  { key: 'companyNumber', label: 'ח.פ/ע.מ', type: 'text', width: 100 },
  { key: 'contactPerson', label: 'איש קשר', type: 'text', width: 150 },
  { key: 'notes', label: 'הערות', type: 'textarea', width: 60 },
];
