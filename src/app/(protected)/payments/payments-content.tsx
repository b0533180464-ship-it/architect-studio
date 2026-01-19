/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { PaymentsTable } from './payments-table';

const statusLabels: Record<string, string> = {
  scheduled: 'מתוכנן', pending: 'ממתין', invoiced: 'חשבונית נשלחה',
  partial: 'שולם חלקית', paid: 'שולם', overdue: 'באיחור', cancelled: 'בוטל',
};

type PaymentStatus = 'scheduled' | 'pending' | 'invoiced' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export function PaymentsContent() {
  const [status, setStatus] = useState<PaymentStatus | undefined>();

  const { data: stats } = trpc.payments.getStats.useQuery();
  const { data: paymentsData, isLoading } = trpc.payments.list.useQuery({ status });
  const { data: overduePayments } = trpc.payments.overdue.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.payments.update.useMutation({
    onSuccess: () => { utils.payments.list.invalidate(); utils.payments.getStats.invalidate(); },
  });

  const handleUpdate = (id: string, field: string, value: unknown) => {
    updateMutation.mutate({ id, [field]: value });
  };

  const payments = paymentsData?.items || [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">תשלומים</h1>
        <Link href="/payments/new"><Button>+ תשלום חדש</Button></Link>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.total}</div><div className="text-sm text-muted-foreground">סה&quot;כ</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.pending}</div><div className="text-sm text-muted-foreground">ממתינים</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-destructive">{stats.overdue}</div><div className="text-sm text-muted-foreground">באיחור</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</div><div className="text-sm text-muted-foreground">שולם</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{formatCurrency(stats.remainingAmount)}</div><div className="text-sm text-muted-foreground">יתרה</div></CardContent></Card>
        </div>
      )}

      {overduePayments && overduePayments.length > 0 && (
        <Card className="mb-6 border-destructive">
          <CardHeader className="pb-2"><CardTitle className="text-destructive">תשלומים באיחור</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y">
              {overduePayments.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/payments/${p.id}`} className="block py-2">
                  <div className="flex items-center justify-between">
                    <span>{p.name} - {p.project.client?.name}</span>
                    <span className="font-medium text-destructive">{formatCurrency(p.amount - p.paidAmount)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex gap-2">
            {[undefined, 'pending', 'paid', 'overdue'].map((s) => (
              <Button key={s ?? 'all'} variant={status === s ? (s === 'overdue' ? 'destructive' : 'default') : 'outline'} size="sm" onClick={() => setStatus(s as PaymentStatus | undefined)}>
                {s ? statusLabels[s] : 'הכל'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>טבלת תשלומים</CardTitle></CardHeader>
        <CardContent>
          <PaymentsTable payments={payments} isLoading={isLoading} onUpdate={handleUpdate} />
        </CardContent>
      </Card>
    </>
  );
}
