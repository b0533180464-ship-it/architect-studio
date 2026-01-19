'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { TableSkeleton, TableEmptyState, EntitySheet } from '@/components/data-table';
import { expensesColumns, statusOptions, type ExpenseTableItem } from './expenses-columns';
import { ExpenseTableRow } from './expense-table-row';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ExpensesTableProps {
  expenses: ExpenseTableItem[];
  isLoading?: boolean;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onDelete?: (id: string) => void;
}

/**
 * טבלת הוצאות עם עריכה inline
 */
export function ExpensesTable({ expenses, isLoading, onUpdate, onDelete }: ExpensesTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) return <TableSkeleton columns={expensesColumns.length} />;
  if (expenses.length === 0) return <TableEmptyState message="אין הוצאות להצגה" />;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse" dir="rtl">
          <ExpenseTableHeader />
          <tbody>
            {expenses.map((expense) => (
              <ExpenseTableRow
                key={expense.id}
                expense={expense}
                onUpdate={(field, value) => onUpdate(expense.id, field, value)}
                onClick={() => setSelectedId(expense.id)}
                onDelete={onDelete ? () => onDelete(expense.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      </div>
      <ExpenseDetailSheet expenseId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

function ExpenseTableHeader() {
  return (
    <thead className="sticky top-0 z-10">
      <tr>
        {expensesColumns.map((col) => (
          <th key={col.key} style={{ width: col.width, minWidth: col.minWidth }} className="py-3 px-2 text-right text-sm font-medium text-muted-foreground border-l border-border/50 bg-muted/30">
            {col.label}{col.required && <span className="text-destructive">*</span>}
          </th>
        ))}
        <th className="py-3 px-2 w-10 bg-muted/30 border-l border-border/50" />
      </tr>
    </thead>
  );
}

function ExpenseDetailSheet({ expenseId, onClose }: { expenseId: string | null; onClose: () => void }) {
  const { data: expense } = trpc.expenses.getById.useQuery({ id: expenseId! }, { enabled: !!expenseId });

  if (!expenseId) return null;

  return (
    <EntitySheet open={!!expenseId} onOpenChange={(open) => !open && onClose()} title={expense?.description || 'פרטי הוצאה'} detailUrl={`/expenses/${expenseId}`}>
      <div className="space-y-4">
        {expense && (
          <>
            <div><span className="text-muted-foreground">תיאור:</span> {expense.description}</div>
            <div><span className="text-muted-foreground">פרויקט:</span> {expense.project?.name || 'הוצאה כללית'}</div>
            <div><span className="text-muted-foreground">ספק:</span> {expense.supplier?.name || '-'}</div>
            <div><span className="text-muted-foreground">סכום:</span> {formatCurrency(expense.amount)}</div>
            <div><span className="text-muted-foreground">סטטוס:</span> {statusOptions.find((o) => o.value === expense.status)?.label}</div>
            <div><span className="text-muted-foreground">תאריך:</span> {formatDate(expense.date)}</div>
            <div><span className="text-muted-foreground">לחיוב:</span> {expense.isBillable ? 'כן' : 'לא'}</div>
            {expense.markupPercent && <div><span className="text-muted-foreground">מרווח:</span> {expense.markupPercent}%</div>}
            {expense.invoiceNumber && <div><span className="text-muted-foreground">מס׳ חשבונית:</span> {expense.invoiceNumber}</div>}
          </>
        )}
      </div>
    </EntitySheet>
  );
}

export { expensesColumns, statusOptions };
