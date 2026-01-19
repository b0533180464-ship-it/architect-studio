/* eslint-disable complexity */
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { TableSkeleton, TableEmptyState, EntitySheet } from '@/components/data-table';
import { productsColumns, currencyOptions, type ProductTableItem } from './products-columns';
import { ProductTableRow } from './product-table-row';
import { formatCurrency } from '@/lib/utils';

interface ProductsTableProps {
  products: ProductTableItem[];
  isLoading?: boolean;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onDelete?: (id: string) => void;
}

/**
 * טבלת מוצרים עם עריכה inline
 */
export function ProductsTable({ products, isLoading, onUpdate, onDelete }: ProductsTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) return <TableSkeleton columns={productsColumns.length} />;
  if (products.length === 0) return <TableEmptyState message="אין מוצרים להצגה" />;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse" dir="rtl">
          <ProductTableHeader />
          <tbody>
            {products.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                onUpdate={(field, value) => onUpdate(product.id, field, value)}
                onClick={() => setSelectedId(product.id)}
                onDelete={onDelete ? () => onDelete(product.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      </div>
      <ProductDetailSheet productId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

function ProductTableHeader() {
  return (
    <thead className="sticky top-0 z-10">
      <tr>
        {productsColumns.map((col) => (
          <th key={col.key} style={{ width: col.width, minWidth: col.minWidth }} className="py-3 px-2 text-right text-sm font-medium text-muted-foreground border-l border-border/50 bg-muted/30">
            {col.label}{col.required && <span className="text-destructive">*</span>}
          </th>
        ))}
        <th className="py-3 px-2 w-10 bg-muted/30 border-l border-border/50" />
      </tr>
    </thead>
  );
}

function ProductDetailSheet({ productId, onClose }: { productId: string | null; onClose: () => void }) {
  const { data: product } = trpc.products.getById.useQuery({ id: productId! }, { enabled: !!productId });

  if (!productId) return null;

  return (
    <EntitySheet open={!!productId} onOpenChange={(open) => !open && onClose()} title={product?.name || 'פרטי מוצר'} detailUrl={`/products/${productId}`}>
      <div className="space-y-4">
        {product && (
          <>
            <div><span className="text-muted-foreground">שם:</span> {product.name}</div>
            {product.sku && <div><span className="text-muted-foreground">מק״ט:</span> {product.sku}</div>}
            <div><span className="text-muted-foreground">קטגוריה:</span> {product.category?.name || '-'}</div>
            <div><span className="text-muted-foreground">ספק:</span> {product.supplier?.name || '-'}</div>
            <div><span className="text-muted-foreground">מחיר עלות:</span> {product.costPrice ? formatCurrency(product.costPrice) : '-'}</div>
            <div><span className="text-muted-foreground">מחיר מחירון:</span> {product.retailPrice ? formatCurrency(product.retailPrice) : '-'}</div>
            <div><span className="text-muted-foreground">מטבע:</span> {currencyOptions.find((o) => o.value === product.currency)?.label || product.currency}</div>
            {product.leadTimeDays && <div><span className="text-muted-foreground">ימי אספקה:</span> {product.leadTimeDays}</div>}
            {product.description && <div><span className="text-muted-foreground">תיאור:</span> {product.description}</div>}
          </>
        )}
      </div>
    </EntitySheet>
  );
}

export { productsColumns, currencyOptions };
