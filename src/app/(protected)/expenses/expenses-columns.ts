import type { ColumnDef } from '@/components/data-table/types';

// אופציות סטטוס
export const statusOptions = [
  { value: 'pending', label: 'ממתין', color: '#f59e0b' },
  { value: 'approved', label: 'אושר', color: '#22c55e' },
  { value: 'rejected', label: 'נדחה', color: '#ef4444' },
  { value: 'reimbursed', label: 'הוחזר', color: '#3b82f6' },
];

// טיפוס הוצאה לטבלה
export interface ExpenseTableItem {
  id: string;
  description: string;
  projectId: string | null;
  supplierId: string | null;
  categoryId: string | null;
  amount: number;
  status: string;
  date: Date | string;
  isBillable: boolean;
  markupPercent: number | null;
  invoiceNumber: string | null;
  project: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
}

// הגדרות עמודות להוצאות - 10 עמודות
export const expensesColumns: ColumnDef<ExpenseTableItem>[] = [
  { key: 'description', label: 'תיאור', type: 'text', width: 'auto', minWidth: 200, required: true, sticky: true },
  { key: 'projectId', label: 'פרויקט', type: 'select', width: 150 },
  { key: 'supplierId', label: 'ספק', type: 'select', width: 150 },
  { key: 'amount', label: 'סכום', type: 'currency', width: 100, required: true },
  { key: 'status', label: 'סטטוס', type: 'select', width: 100, options: statusOptions },
  { key: 'date', label: 'תאריך', type: 'date', width: 120, required: true },
  { key: 'isBillable', label: 'לחיוב', type: 'checkbox', width: 80 },
  { key: 'markupPercent', label: 'מרווח %', type: 'number', width: 80 },
  { key: 'invoiceNumber', label: 'מס\' חשבונית', type: 'text', width: 100 },
  { key: 'categoryId', label: 'קטגוריה', type: 'config-select', width: 120, entityType: 'expense_category' },
];
