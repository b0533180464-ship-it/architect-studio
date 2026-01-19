import type { ColumnDef } from '@/components/data-table/types';

// אופציות סוג תשלום
export const paymentTypeOptions = [
  { value: 'retainer', label: 'מקדמה' },
  { value: 'milestone', label: 'אבן דרך' },
  { value: 'scheduled', label: 'מתוזמן' },
  { value: 'final', label: 'סופי' },
  { value: 'change_order', label: 'שינויים' },
  { value: 'hourly', label: 'לפי שעות' },
  { value: 'expense', label: 'הוצאות' },
];

// אופציות סטטוס
export const statusOptions = [
  { value: 'scheduled', label: 'מתוכנן', color: '#94a3b8' },
  { value: 'pending', label: 'ממתין', color: '#3b82f6' },
  { value: 'invoiced', label: 'חשבונית', color: '#8b5cf6' },
  { value: 'partial', label: 'חלקי', color: '#f59e0b' },
  { value: 'paid', label: 'שולם', color: '#22c55e' },
  { value: 'overdue', label: 'באיחור', color: '#ef4444' },
  { value: 'cancelled', label: 'בוטל', color: '#6b7280' },
];

// טיפוס תשלום לטבלה
export interface PaymentTableItem {
  id: string;
  name: string;
  projectId: string;
  paymentType: string;
  amount: number;
  status: string;
  dueDate: Date | string | null;
  paidAmount: number;
  paidAt?: Date | string | null;
  milestoneDescription: string | null;
  description: string | null;
  project: { id: string; name: string; client?: { id: string; name: string } | null };
}

// הגדרות עמודות לתשלומים - 9 עמודות + textarea
export const paymentsColumns: ColumnDef<PaymentTableItem>[] = [
  { key: 'name', label: 'שם תשלום', type: 'text', width: 'auto', minWidth: 200, required: true, sticky: true },
  { key: 'projectId', label: 'פרויקט', type: 'select', width: 150, required: true },
  { key: 'paymentType', label: 'סוג', type: 'select', width: 120, options: paymentTypeOptions },
  { key: 'amount', label: 'סכום', type: 'currency', width: 100, required: true },
  { key: 'status', label: 'סטטוס', type: 'select', width: 100, options: statusOptions },
  { key: 'dueDate', label: 'תאריך יעד', type: 'date', width: 120 },
  { key: 'paidAmount', label: 'שולם', type: 'currency', width: 100 },
  { key: 'paidAt', label: 'תאריך תשלום', type: 'date', width: 120 },
  { key: 'milestoneDescription', label: 'אבן דרך', type: 'text', width: 150 },
  { key: 'description', label: 'תיאור', type: 'textarea', width: 60 },
];
