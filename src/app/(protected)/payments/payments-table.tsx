'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { TableSkeleton, TableEmptyState, EntitySheet } from '@/components/data-table';
import { paymentsColumns, paymentTypeOptions, statusOptions, type PaymentTableItem } from './payments-columns';
import { PaymentTableRow } from './payment-table-row';
import { formatCurrency } from '@/lib/utils';

interface PaymentsTableProps {
  payments: PaymentTableItem[];
  isLoading?: boolean;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onDelete?: (id: string) => void;
}

/**
 * טבלת תשלומים עם עריכה inline
 */
export function PaymentsTable({ payments, isLoading, onUpdate, onDelete }: PaymentsTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) return <TableSkeleton columns={paymentsColumns.length} />;
  if (payments.length === 0) return <TableEmptyState message="אין תשלומים להצגה" />;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse" dir="rtl">
          <PaymentTableHeader />
          <tbody>
            {payments.map((payment) => (
              <PaymentTableRow
                key={payment.id}
                payment={payment}
                onUpdate={(field, value) => onUpdate(payment.id, field, value)}
                onClick={() => setSelectedId(payment.id)}
                onDelete={onDelete ? () => onDelete(payment.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      </div>
      <PaymentDetailSheet paymentId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

function PaymentTableHeader() {
  return (
    <thead className="sticky top-0 z-10">
      <tr>
        {paymentsColumns.map((col) => (
          <th key={col.key} style={{ width: col.width, minWidth: col.minWidth }} className="py-3 px-2 text-right text-sm font-medium text-muted-foreground border-l border-border/50 bg-muted/30">
            {col.label}{col.required && <span className="text-destructive">*</span>}
          </th>
        ))}
        <th className="py-3 px-2 w-10 bg-muted/30 border-l border-border/50" />
      </tr>
    </thead>
  );
}

function PaymentDetailSheet({ paymentId, onClose }: { paymentId: string | null; onClose: () => void }) {
  const { data: payment } = trpc.payments.getById.useQuery({ id: paymentId! }, { enabled: !!paymentId });

  if (!paymentId) return null;

  return (
    <EntitySheet open={!!paymentId} onOpenChange={(open) => !open && onClose()} title={payment?.name || 'פרטי תשלום'} detailUrl={`/payments/${paymentId}`}>
      <div className="space-y-4">
        {payment && (
          <>
            <div><span className="text-muted-foreground">שם:</span> {payment.name}</div>
            <div><span className="text-muted-foreground">פרויקט:</span> {payment.project.name}</div>
            <div><span className="text-muted-foreground">סוג:</span> {paymentTypeOptions.find((o) => o.value === payment.paymentType)?.label}</div>
            <div><span className="text-muted-foreground">סכום:</span> {formatCurrency(payment.amount)}</div>
            <div><span className="text-muted-foreground">סטטוס:</span> {statusOptions.find((o) => o.value === payment.status)?.label}</div>
            <div><span className="text-muted-foreground">שולם:</span> {formatCurrency(payment.paidAmount)}</div>
            {payment.description && <div><span className="text-muted-foreground">תיאור:</span> {payment.description}</div>}
          </>
        )}
      </div>
    </EntitySheet>
  );
}

export { paymentsColumns, paymentTypeOptions, statusOptions };
