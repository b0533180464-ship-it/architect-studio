import type { ColumnDef } from '@/components/data-table/types';

// אופציות מטבע
export const currencyOptions = [
  { value: 'ILS', label: 'ILS - שקל' },
  { value: 'USD', label: 'USD - דולר' },
  { value: 'EUR', label: 'EUR - אירו' },
];

// טיפוס מוצר לטבלה
export interface ProductTableItem {
  id: string;
  name: string;
  sku: string | null;
  categoryId: string | null;
  supplierId: string | null;
  costPrice: number | null;
  retailPrice: number | null;
  currency: string;
  width: number | null;
  height: number | null;
  depth: number | null;
  unit: string | null;
  leadTimeDays: number | null;
  description: string | null;
  supplier?: { id: string; name: string } | null;
  category?: { id: string; name: string; color: string | null } | null;
}

// פונקציה לחישוב מידות כטקסט
export function formatDimensions(product: ProductTableItem): string | null {
  const { width, height, depth, unit } = product;
  if (!width && !height && !depth) return null;
  const parts = [width, height, depth].filter(Boolean);
  return parts.length > 0 ? `${parts.join(' × ')} ${unit || 'cm'}` : null;
}

// הגדרות עמודות למוצרים - 10 עמודות
export const productsColumns: ColumnDef<ProductTableItem>[] = [
  { key: 'name', label: 'שם מוצר', type: 'text', width: 'auto', minWidth: 200, required: true, sticky: true },
  { key: 'sku', label: 'מק"ט', type: 'text', width: 100 },
  { key: 'categoryId', label: 'קטגוריה', type: 'config-select', width: 120, entityType: 'product_category' },
  { key: 'supplierId', label: 'ספק', type: 'select', width: 150 },
  { key: 'costPrice', label: 'מחיר עלות', type: 'currency', width: 100 },
  { key: 'retailPrice', label: 'מחיר מחירון', type: 'currency', width: 100 },
  { key: 'currency', label: 'מטבע', type: 'select', width: 80, options: currencyOptions },
  { key: 'leadTimeDays', label: 'ימי אספקה', type: 'number', width: 80 },
  { key: 'description', label: 'תיאור', type: 'textarea', width: 60 },
];
