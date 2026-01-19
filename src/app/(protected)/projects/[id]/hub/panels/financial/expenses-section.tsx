/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface ExpensesSectionProps {
  projectId: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  reimbursed: 'bg-blue-100 text-blue-700',
};

const statusLabels: Record<string, string> = {
  pending: 'ממתין',
  approved: 'אושר',
  rejected: 'נדחה',
  reimbursed: 'הוחזר',
};

export function ExpensesSection({ projectId }: ExpensesSectionProps) {
  const { data } = trpc.expenses.list.useQuery({ projectId, pageSize: 5 });

  const expenses = data?.items || [];
  const total = data?.pagination.total || 0;

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const billableAmount = expenses.filter((e) => e.isBillable).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">הוצאות ({total})</h4>
        <Link href={`/expenses/new?projectId=${projectId}`}>
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <Plus className="h-4 w-4 ml-1" />
            חדש
          </Button>
        </Link>
      </div>

      {total > 0 && (
        <div className="flex gap-4 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <span>סה״כ: {formatCurrency(totalAmount)}</span>
          <span>לחיוב: {formatCurrency(billableAmount)}</span>
        </div>
      )}

      {expenses.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">אין הוצאות</p>
      ) : (
        <div className="space-y-1">
          {expenses.map((expense) => (
            <Link key={expense.id} href={`/expenses/${expense.id}`}>
              <div className="flex items-center justify-between p-2 rounded hover:bg-muted text-sm">
                <div className="flex-1 min-w-0">
                  <span className="truncate block">{expense.description}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(expense.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(expense.amount)}</span>
                  <Badge className={statusColors[expense.status] || ''}>
                    {statusLabels[expense.status] || expense.status}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
          {total > 5 && (
            <Link href={`/expenses?projectId=${projectId}`}>
              <Button variant="ghost" size="sm" className="w-full text-xs">
                צפה בכל {total} ההוצאות
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
