'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { TableSkeleton, TableEmptyState, EntitySheet } from '@/components/data-table';
import { suppliersColumns, type SupplierTableItem } from './suppliers-columns';
import { SupplierTableRow } from './supplier-table-row';

interface SuppliersTableProps {
  suppliers: SupplierTableItem[];
  isLoading?: boolean;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onDelete?: (id: string) => void;
}

/**
 * טבלת ספקים עם עריכה inline
 */
export function SuppliersTable({ suppliers, isLoading, onUpdate, onDelete }: SuppliersTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) return <TableSkeleton columns={suppliersColumns.length} />;
  if (suppliers.length === 0) return <TableEmptyState message="אין ספקים להצגה" />;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse" dir="rtl">
          <SupplierTableHeader />
          <tbody>
            {suppliers.map((supplier) => (
              <SupplierTableRow
                key={supplier.id}
                supplier={supplier}
                onUpdate={(field, value) => onUpdate(supplier.id, field, value)}
                onClick={() => setSelectedId(supplier.id)}
                onDelete={onDelete ? () => onDelete(supplier.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      </div>
      <SupplierDetailSheet supplierId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

function SupplierTableHeader() {
  return (
    <thead className="sticky top-0 z-10">
      <tr>
        {suppliersColumns.map((col) => (
          <th key={col.key} style={{ width: col.width, minWidth: col.minWidth }} className="py-3 px-2 text-right text-sm font-medium text-muted-foreground border-l border-border/50 bg-muted/30">
            {col.label}{col.required && <span className="text-destructive">*</span>}
          </th>
        ))}
        <th className="py-3 px-2 w-10 bg-muted/30 border-l border-border/50" />
      </tr>
    </thead>
  );
}

function SupplierDetailSheet({ supplierId, onClose }: { supplierId: string | null; onClose: () => void }) {
  const { data: supplier } = trpc.suppliers.getById.useQuery({ id: supplierId! }, { enabled: !!supplierId });

  if (!supplierId) return null;

  const renderRating = (rating: number | null) => {
    if (!rating) return '-';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <EntitySheet open={!!supplierId} onOpenChange={(open) => !open && onClose()} title={supplier?.name || 'פרטי ספק'} detailUrl={`/suppliers/${supplierId}`}>
      <div className="space-y-4">
        {supplier && (
          <>
            <div><span className="text-muted-foreground">שם:</span> {supplier.name}</div>
            <div><span className="text-muted-foreground">קטגוריה:</span> {supplier.category?.name || '-'}</div>
            <div><span className="text-muted-foreground">איש קשר:</span> {supplier.contactPerson || '-'}</div>
            <div><span className="text-muted-foreground">אימייל:</span> {supplier.email || '-'}</div>
            <div><span className="text-muted-foreground">טלפון:</span> {supplier.phone || '-'}</div>
            <div><span className="text-muted-foreground">עיר:</span> {supplier.city || '-'}</div>
            <div><span className="text-muted-foreground">דירוג:</span> <span className="text-yellow-500">{renderRating(supplier.rating)}</span></div>
            {supplier.notes && <div><span className="text-muted-foreground">הערות:</span> {supplier.notes}</div>}
          </>
        )}
      </div>
    </EntitySheet>
  );
}

export { suppliersColumns };
