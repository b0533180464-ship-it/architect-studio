/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ArrowRight, Trash2, Check, X } from 'lucide-react';

const statusLabels: Record<string, string> = {
  pending: 'ממתין לאישור', approved: 'אושר', rejected: 'נדחה', reimbursed: 'הוחזר',
};

const statusColors: Record<string, string> = {
  pending: 'secondary', approved: 'success', rejected: 'destructive', reimbursed: 'default',
};

export function ExpenseDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: expense, isLoading } = trpc.expenses.getById.useQuery({ id });

  const approveMutation = trpc.expenses.approve.useMutation({
    onSuccess: () => { utils.expenses.invalidate(); },
  });

  const rejectMutation = trpc.expenses.reject.useMutation({
    onSuccess: () => { utils.expenses.invalidate(); },
  });

  const deleteMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => { router.push('/expenses'); },
  });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">טוען...</div>;
  if (!expense) return <div className="text-center py-8 text-muted-foreground">הוצאה לא נמצאה</div>;

  const handleApprove = () => {
    if (confirm('האם לאשר את ההוצאה?')) {
      approveMutation.mutate({ id });
    }
  };

  const handleReject = () => {
    if (confirm('האם לדחות את ההוצאה?')) {
      rejectMutation.mutate({ id });
    }
  };

  const handleDelete = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק הוצאה זו?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/expenses"><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-semibold">פרטי הוצאה</h1>
            <div className="text-sm text-muted-foreground">{formatDate(expense.date)}</div>
          </div>
          <Badge variant={statusColors[expense.status] as 'default' | 'secondary' | 'destructive' | 'outline'}>
            {statusLabels[expense.status]}
          </Badge>
          {expense.isBillable && <Badge variant="outline">לחיוב</Badge>}
        </div>
        <div className="flex gap-2">
          {expense.status === 'pending' && (
            <>
              <Button onClick={handleApprove} disabled={approveMutation.isPending}><Check className="h-4 w-4 ml-1" />אשר</Button>
              <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}><X className="h-4 w-4 ml-1" />דחה</Button>
              <Button variant="outline" onClick={() => router.push(`/expenses/${id}/edit`)}>עריכה</Button>
              <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleteMutation.isPending}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>פרטים כלליים</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="text-sm text-muted-foreground">תיאור</div><div className="font-medium">{expense.description}</div></div>
            {expense.project && (
              <>
                <div><div className="text-sm text-muted-foreground">פרויקט</div><div className="font-medium">{expense.project.name}</div></div>
                <div><div className="text-sm text-muted-foreground">לקוח</div><div className="font-medium">{expense.project.client.name}</div></div>
              </>
            )}
            {expense.supplier && <div><div className="text-sm text-muted-foreground">ספק</div><div className="font-medium">{expense.supplier.name}</div></div>}
            {expense.invoiceNumber && <div><div className="text-sm text-muted-foreground">מספר חשבונית</div><div className="font-medium">{expense.invoiceNumber}</div></div>}
            <div><div className="text-sm text-muted-foreground">תאריך</div><div className="font-medium">{formatDate(expense.date)}</div></div>
            <div><div className="text-sm text-muted-foreground">נוצר</div><div className="font-medium">{formatDate(expense.createdAt)}</div></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>סכומים</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="text-sm text-muted-foreground">סכום הוצאה</div><div className="text-2xl font-bold">{formatCurrency(expense.amount)}</div></div>
            {expense.isBillable && (
              <>
                {expense.markupPercent && expense.markupPercent > 0 && (
                  <div><div className="text-sm text-muted-foreground">מרווח</div><div className="text-xl font-medium">{expense.markupPercent}%</div></div>
                )}
                <div><div className="text-sm text-muted-foreground">סכום לחיוב</div><div className="text-xl font-medium text-green-600">{formatCurrency(expense.billedAmount ?? expense.amount)}</div></div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {expense.receiptUrl && (
        <Card className="mt-6">
          <CardHeader><CardTitle>קבלה</CardTitle></CardHeader>
          <CardContent>
            <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              צפה בקבלה
            </a>
          </CardContent>
        </Card>
      )}
    </>
  );
}
