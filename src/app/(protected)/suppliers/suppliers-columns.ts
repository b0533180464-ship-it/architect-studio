import type { ColumnDef } from '@/components/data-table/types';

// טיפוס ספק לטבלה
export interface SupplierTableItem {
  id: string;
  name: string;
  categoryId: string | null;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  rating: number | null;
  notes: string | null;
  category?: { id: string; name: string; color: string | null } | null;
}

// הגדרות עמודות לספקים - 8 עמודות
export const suppliersColumns: ColumnDef<SupplierTableItem>[] = [
  { key: 'name', label: 'שם ספק', type: 'text', width: 'auto', minWidth: 180, required: true, sticky: true },
  { key: 'categoryId', label: 'קטגוריה', type: 'config-select', width: 120, entityType: 'supplier_category' },
  { key: 'contactPerson', label: 'איש קשר', type: 'text', width: 150 },
  { key: 'email', label: 'אימייל', type: 'text', width: 180 },
  { key: 'phone', label: 'טלפון', type: 'text', width: 120 },
  { key: 'city', label: 'עיר', type: 'text', width: 100 },
  { key: 'rating', label: 'דירוג', type: 'rating', width: 100 },
  { key: 'notes', label: 'הערות', type: 'textarea', width: 60 },
];
