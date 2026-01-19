/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ExpensesTable } from './expenses-table';

const statusLabels: Record<string, string> = {
  pending: 'ממתין', approved: 'אושר', rejected: 'נדחה', reimbursed: 'הוחזר',
};

type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reimbursed';

export function ExpensesContent() {
  const [status, setStatus] = useState<ExpenseStatus | undefined>();
  const [billableOnly, setBillableOnly] = useState(false);

  const { data: summary } = trpc.expenses.summary.useQuery({});
  const { data: expensesData, isLoading } = trpc.expenses.list.useQuery({
    status,
    isBillable: billableOnly ? true : undefined,
  });
  const utils = trpc.useUtils();

  const updateMutation = trpc.expenses.update.useMutation({
    onSuccess: () => { utils.expenses.list.invalidate(); utils.expenses.summary.invalidate(); },
  });

  const handleUpdate = (id: string, field: string, value: unknown) => {
    updateMutation.mutate({ id, [field]: value });
  };

  const expenses = expensesData?.items || [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">הוצאות</h1>
        <Link href="/expenses/new"><Button>+ הוצאה חדשה</Button></Link>
      </div>

      {summary && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{summary.total}</div><div className="text-sm text-muted-foreground">סה&quot;כ הוצאות</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div><div className="text-sm text-muted-foreground">סכום כולל</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{summary.billable}</div><div className="text-sm text-muted-foreground">לחיוב</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{formatCurrency(summary.billableAmount)}</div><div className="text-sm text-muted-foreground">סכום לחיוב</div></CardContent></Card>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex gap-2">
            {[undefined, 'pending', 'approved', 'rejected'].map((s) => (
              <Button key={s ?? 'all'} variant={status === s ? 'default' : 'outline'} size="sm" onClick={() => setStatus(s as ExpenseStatus | undefined)}>
                {s ? statusLabels[s] : 'הכל'}
              </Button>
            ))}
            <Button variant={billableOnly ? 'default' : 'outline'} size="sm" onClick={() => setBillableOnly(!billableOnly)}>
              לחיוב לקוח
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>טבלת הוצאות</CardTitle></CardHeader>
        <CardContent>
          <ExpensesTable expenses={expenses} isLoading={isLoading} onUpdate={handleUpdate} />
        </CardContent>
      </Card>
    </>
  );
}
